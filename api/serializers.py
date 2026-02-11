from rest_framework import serializers
from django.contrib.auth.models import User
from quiz.models import Quiz, Question, AnswerOption, QuizResult, UserAnswer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords must match'})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'Email already registered'})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = ['id', 'text', 'is_correct', 'order']
        read_only_fields = ['id']


class QuestionSerializer(serializers.ModelSerializer):
    options = AnswerOptionSerializer(many=True, read_only=False)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'image', 'points', 'order', 'explanation', 'options']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        
        for option_data in options_data:
            AnswerOption.objects.create(question=question, **option_data)
        
        return question
    
    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        
        # Update question fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update options if provided
        if options_data is not None:
            # Delete existing options and create new ones
            instance.options.all().delete()
            for option_data in options_data:
                AnswerOption.objects.create(question=instance, **option_data)
        
        return instance


class QuestionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing questions without answer correctness"""
    options = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'image', 'points', 'order', 'options']
    
    def get_options(self, obj):
        # Don't expose which answer is correct when listing questions for quiz takers
        return [{'id': opt.id, 'text': opt.text, 'order': opt.order} for opt in obj.options.all()]


class QuizSerializer(serializers.ModelSerializer):
    host = UserSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'host', 'title', 'description', 'code', 'category', 'status',
            'time_limit', 'show_correct_answers', 'allow_retake',
            'created_at', 'updated_at', 'questions', 'question_count'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
    
    def get_question_count(self, obj):
        return obj.questions.count()


class QuizListSerializer(serializers.ModelSerializer):
    """Simplified serializer for quiz lists"""
    host_username = serializers.CharField(source='host.username', read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'code', 'category', 'status',
            'host_username', 'time_limit', 'created_at', 'question_count'
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()


class QuizCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating quizzes without nested questions"""
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'category', 'status',
            'time_limit', 'show_correct_answers', 'allow_retake'
        ]
        read_only_fields = ['id']


class UserAnswerSerializer(serializers.ModelSerializer):
    selected_option_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )
    
    class Meta:
        model = UserAnswer
        fields = ['id', 'question', 'selected_option_ids', 'is_correct', 'answered_at']
        read_only_fields = ['id', 'is_correct', 'answered_at']


class QuizResultSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    quiz = QuizListSerializer(read_only=True)
    answers = UserAnswerSerializer(many=True, read_only=True)
    percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = QuizResult
        fields = [
            'id', 'user', 'quiz', 'score', 'total_questions',
            'percentage', 'time_taken', 'completed_at', 'answers'
        ]
        read_only_fields = ['id', 'completed_at']


class AnswerSubmissionSerializer(serializers.Serializer):
    """Serializer for a single answer"""
    question_id = serializers.IntegerField()
    selected_option_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )


class QuizSubmissionSerializer(serializers.Serializer):
    """Serializer for submitting quiz answers"""
    quiz_code = serializers.CharField(max_length=8)
    answers = AnswerSubmissionSerializer(many=True)
    time_taken = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_quiz_code(self, value):
        try:
            quiz = Quiz.objects.get(code=value, status='published')
        except Quiz.DoesNotExist:
            raise serializers.ValidationError('Invalid quiz code or quiz not published')
        return value
