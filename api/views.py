from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from rest_framework import exceptions, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from quiz.models import Question, Quiz, QuizResult, UserAnswer

from .serializers import (
    QuestionPlaySerializer,
    QuestionSerializer,
    QuizCreateUpdateSerializer,
    QuizListSerializer,
    QuizPlaySerializer,
    QuizResultSerializer,
    QuizSerializer,
    QuizSubmissionSerializer,
    UserSerializer,
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only owners may modify an object; everyone may read public objects."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, "host", None) or getattr(obj, "user", None)
        if owner is None and hasattr(obj, "quiz"):
            owner = obj.quiz.host
        return owner == request.user


class QuizViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Quiz.objects.select_related("host").prefetch_related("questions__options")
        user = self.request.user

        if self.action == "list":
            if user.is_authenticated:
                return queryset.filter(Q(status="published") | Q(host=user))
            return queryset.filter(status="published")

        if self.action in {"retrieve", "results"}:
            if user.is_authenticated:
                return queryset.filter(Q(status="published") | Q(host=user))
            return queryset.filter(status="published")

        if self.action == "by_code":
            return queryset.filter(status="published")

        if not user.is_authenticated:
            return queryset.none()
        return queryset.filter(host=user)

    def get_serializer_class(self):
        if self.action == "list":
            return QuizListSerializer

        if self.action == "by_code":
            return QuizPlaySerializer

        if self.action == "results":
            return QuizResultSerializer

        if self.action in {"create", "update", "partial_update"}:
            return QuizCreateUpdateSerializer

        if self.action == "retrieve":
            obj = self.get_object()
            if self.request.user.is_authenticated and obj.host_id == self.request.user.id:
                return QuizSerializer
            return QuizPlaySerializer

        return QuizSerializer

    def perform_create(self, serializer):
        # Quizzes always start as drafts; the explicit publish action validates them.
        serializer.save(host=self.request.user, status="draft")

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_quizzes(self, request):
        quizzes = Quiz.objects.filter(host=request.user).prefetch_related("questions").order_by("-created_at")
        return Response(QuizListSerializer(quizzes, many=True).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        quiz = self.get_object()
        if quiz.host != request.user:
            return Response({"error": "You do not own this quiz."}, status=status.HTTP_403_FORBIDDEN)

        questions = list(quiz.questions.prefetch_related("options"))
        if not questions:
            return Response(
                {"error": "Add at least one question before publishing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for question in questions:
            options = list(question.options.all())
            max_options = 6 if question.question_type == "multi_select" else 4
            if len(options) < 2:
                return Response(
                    {"error": f'Question "{question.text[:40]}" needs at least 2 options.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if len(options) > max_options:
                return Response(
                    {"error": f'Question "{question.text[:40]}" has too many options.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not any(option.is_correct for option in options):
                return Response(
                    {"error": f'Question "{question.text[:40]}" needs a correct answer.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        quiz.status = "published"
        quiz.save(update_fields=["status", "updated_at"])
        return Response(QuizSerializer(quiz).data)

    @action(detail=True, methods=["get"], url_path="by_code")
    def by_code(self, request, pk=None):
        code = (pk or "").strip().upper()
        quiz = (
            Quiz.objects.filter(code=code, status="published")
            .select_related("host")
            .prefetch_related("questions__options")
            .first()
        )
        if not quiz:
            return Response(
                {"error": "Quiz not found or not published."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(QuizPlaySerializer(quiz).data)

    @action(detail=True, methods=["get"])
    def results(self, request, pk=None):
        quiz = self.get_object()
        if quiz.host != request.user:
            return Response(
                {"error": "You do not have permission to view these results."},
                status=status.HTTP_403_FORBIDDEN,
            )
        results = (
            QuizResult.objects.filter(quiz=quiz)
            .select_related("quiz", "user")
            .prefetch_related("answers__selected_options")
        )
        return Response(QuizResultSerializer(results, many=True).data)


class QuestionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.select_related("quiz", "quiz__host").prefetch_related("options")
        quiz_id = self.request.query_params.get("quiz_id")
        user = self.request.user

        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)

        if user.is_authenticated:
            if quiz_id:
                return queryset.filter(
                    Q(quiz__status="published") | Q(quiz__host=user)
                )
            return queryset.filter(Q(quiz__status="published") | Q(quiz__host=user))

        return queryset.filter(quiz__status="published")

    def _is_owner(self):
        user = self.request.user
        if not user.is_authenticated:
            return False
        if self.action == "retrieve":
            return self.get_object().quiz.host_id == user.id
        if self.action == "list":
            quiz_id = self.request.query_params.get("quiz_id")
            if not quiz_id:
                return False
            return Quiz.objects.filter(id=quiz_id, host=user).exists()
        return True

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return QuestionSerializer
        return QuestionSerializer if self._is_owner() else QuestionPlaySerializer

    def perform_create(self, serializer):
        quiz_id = self.request.data.get("quiz_id")
        if not quiz_id:
            raise exceptions.PermissionDenied("quiz_id is required.")
        quiz = Quiz.objects.filter(id=quiz_id, host=self.request.user).first()
        if not quiz:
            raise exceptions.PermissionDenied("You can only add questions to your own quizzes.")
        serializer.save(quiz=quiz)

    def perform_update(self, serializer):
        if serializer.instance.quiz.host != self.request.user:
            raise exceptions.PermissionDenied("You can only edit questions in your own quizzes.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.quiz.host != self.request.user:
            raise exceptions.PermissionDenied("You can only delete questions from your own quizzes.")
        instance.delete()


class QuizResultViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuizResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            QuizResult.objects.filter(user=self.request.user)
            .select_related("quiz", "user")
            .prefetch_related("answers__selected_options")
        )

    @action(detail=False, methods=["post"])
    def submit(self, request):
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        quiz = Quiz.objects.filter(code=data["quiz_code"], status="published").first()
        if not quiz:
            return Response(
                {"error": "Quiz not found or not published."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not quiz.allow_retake and QuizResult.objects.filter(user=request.user, quiz=quiz).exists():
            return Response(
                {"error": "You have already taken this quiz and retakes are disabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        questions = {
            question.id: question
            for question in quiz.questions.prefetch_related("options")
        }
        if not questions:
            return Response(
                {"error": "This quiz has no questions."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate that every submitted question belongs to the quiz and that
        # every selected option belongs to that question.
        seen_question_ids = set()
        normalized_answers = []
        for item in data["answers"]:
            question_id = item["question_id"]
            if question_id in seen_question_ids:
                return Response(
                    {"error": "Each question can only be answered once."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            seen_question_ids.add(question_id)

            question = questions.get(question_id)
            if not question:
                return Response(
                    {"error": f"Question {question_id} does not belong to this quiz."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            valid_option_ids = set(question.options.values_list("id", flat=True))
            selected_ids = set(item["selected_option_ids"])
            if not selected_ids.issubset(valid_option_ids):
                return Response(
                    {"error": f"Invalid option selected for question {question_id}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            correct_ids = set(question.options.filter(is_correct=True).values_list("id", flat=True))
            normalized_answers.append(
                {
                    "question": question,
                    "selected_ids": selected_ids,
                    "is_correct": selected_ids == correct_ids,
                }
            )

        with transaction.atomic():
            result = QuizResult.objects.create(
                user=request.user,
                quiz=quiz,
                score=0,
                total_questions=len(questions),
                time_taken=data.get("time_taken"),
            )

            score = 0
            for answer in normalized_answers:
                if answer["is_correct"]:
                    score += answer["question"].points
                user_answer = UserAnswer.objects.create(
                    quiz_result=result,
                    question=answer["question"],
                    is_correct=answer["is_correct"],
                )
                user_answer.selected_options.set(answer["selected_ids"])

            result.score = score
            result.save(update_fields=["score"])

        return Response(
            QuizResultSerializer(result).data,
            status=status.HTTP_201_CREATED,
        )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(self.get_serializer(request.user).data)
