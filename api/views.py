from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from quiz.models import Quiz, Question, AnswerOption, QuizResult, UserAnswer
from .serializers import (
    UserSerializer, QuizSerializer, QuizListSerializer, QuizCreateUpdateSerializer,
    QuestionSerializer, QuestionListSerializer, AnswerOptionSerializer,
    QuizResultSerializer, QuizSubmissionSerializer, UserAnswerSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners of an object to edit it."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if obj has a 'host' attribute (Quiz) or 'user' attribute (QuizResult)
        if hasattr(obj, 'host'):
            return obj.host == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Quiz CRUD operations
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        queryset = Quiz.objects.select_related('host').prefetch_related('questions__options')
        
        # Filter based on user role
        if self.action in ['list']:
            # For list view, show published quizzes or user's own quizzes
            if self.request.user.is_authenticated:
                queryset = queryset.filter(
                    Q(status='published') | Q(host=self.request.user)
                )
            else:
                queryset = queryset.filter(status='published')
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuizListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return QuizCreateUpdateSerializer
        return QuizSerializer
    
    def perform_create(self, serializer):
        serializer.save(host=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_quizzes(self, request):
        """Get quizzes created by the current user"""
        quizzes = self.get_queryset().filter(host=request.user)
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a draft quiz"""
        quiz = self.get_object()
        
        if quiz.host != request.user:
            return Response(
                {'error': 'You do not have permission to publish this quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if quiz.questions.count() == 0:
            return Response(
                {'error': 'Cannot publish quiz without questions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quiz.status = 'published'
        quiz.save()
        serializer = self.get_serializer(quiz)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def by_code(self, request, pk=None):
        """Get quiz by code instead of ID"""
        try:
            quiz = Quiz.objects.get(code=pk, status='published')
            serializer = QuizSerializer(quiz)
            return Response(serializer.data)
        except Quiz.DoesNotExist:
            return Response(
                {'error': 'Quiz not found or not published'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get all results for a quiz (only for quiz host)"""
        quiz = self.get_object()
        
        if quiz.host != request.user:
            return Response(
                {'error': 'You do not have permission to view these results'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        results = QuizResult.objects.filter(quiz=quiz).select_related('user')
        serializer = QuizResultSerializer(results, many=True)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Question CRUD operations
    """
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Question.objects.select_related('quiz').prefetch_related('options')
        
        # Filter by quiz if provided
        quiz_id = self.request.query_params.get('quiz_id')
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        return queryset
    
    def perform_create(self, serializer):
        quiz_id = self.request.data.get('quiz_id')
        try:
            quiz = Quiz.objects.get(id=quiz_id, host=self.request.user)
            serializer.save(quiz=quiz)
        except Quiz.DoesNotExist:
            raise permissions.PermissionDenied('You can only add questions to your own quizzes')
    
    def perform_update(self, serializer):
        question = self.get_object()
        if question.quiz.host != self.request.user:
            raise permissions.PermissionDenied('You can only update questions in your own quizzes')
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.quiz.host != self.request.user:
            raise permissions.PermissionDenied('You can only delete questions from your own quizzes')
        instance.delete()


class QuizResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing quiz results
    """
    serializer_class = QuizResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own results
        return QuizResult.objects.filter(user=self.request.user).select_related('quiz', 'user')
    
    @action(detail=False, methods=['post'])
    def submit(self, request):
        """Submit quiz answers and calculate results"""
        # Debug logging
        import json
        print("Received submission data:", json.dumps(request.data, indent=2))
        
        serializer = QuizSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        quiz_code = serializer.validated_data['quiz_code']
        answers_data = serializer.validated_data['answers']
        time_taken = serializer.validated_data.get('time_taken')
        
        try:
            quiz = Quiz.objects.get(code=quiz_code, status='published')
        except Quiz.DoesNotExist:
            return Response(
                {'error': 'Quiz not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if retakes are allowed
        if not quiz.allow_retake:
            existing_result = QuizResult.objects.filter(user=request.user, quiz=quiz).first()
            if existing_result:
                return Response(
                    {'error': 'You have already taken this quiz and retakes are not allowed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Calculate score
        score = 0
        total_questions = quiz.questions.count()
        
        # Create quiz result
        quiz_result = QuizResult.objects.create(
            user=request.user,
            quiz=quiz,
            score=0,  # Will update after checking answers
            total_questions=total_questions,
            time_taken=time_taken
        )
        
        # Process each answer
        for answer_item in answers_data:
            question_id = answer_item.get('question_id')
            selected_option_ids = answer_item.get('selected_option_ids', [])
            
            try:
                question = Question.objects.get(id=question_id, quiz=quiz)
                correct_options = set(question.options.filter(is_correct=True).values_list('id', flat=True))
                selected_options_set = set(selected_option_ids)
                
                is_correct = correct_options == selected_options_set
                
                if is_correct:
                    score += question.points
                
                # Save user answer
                user_answer = UserAnswer.objects.create(
                    quiz_result=quiz_result,
                    question=question,
                    is_correct=is_correct
                )
                user_answer.selected_options.set(selected_option_ids)
                
            except Question.DoesNotExist:
                continue
        
        # Update final score
        quiz_result.score = score
        quiz_result.save()
        
        # Return result
        result_serializer = QuizResultSerializer(quiz_result)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for user operations
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
