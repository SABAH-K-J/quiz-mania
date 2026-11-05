from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from quiz.models import AnswerOption, Question, Quiz, QuizResult, UserAnswer


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    password2 = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2", "first_name", "last_name"]

    def validate_username(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("That username is already taken.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("That email is already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})

        try:
            validate_password(data["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})

        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ---------------------------------------------------------------------------
# Questions and options
# ---------------------------------------------------------------------------


class AnswerOptionSerializer(serializers.ModelSerializer):
    # Writable so owners can update an option in place and keep historical
    # answer references intact instead of deleting and recreating everything.
    id = serializers.IntegerField(required=False)

    class Meta:
        model = AnswerOption
        fields = ["id", "text", "is_correct", "order"]

    def validate_text(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Option text cannot be empty.")
        if len(value) > 500:
            raise serializers.ValidationError("Option text cannot exceed 500 characters.")
        return value

    def validate_order(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Order must be a non-negative number.")
        return value


MIN_OPTIONS = 2


def max_options_for(question_type: str) -> int:
    return 6 if question_type == "multi_select" else 4


class QuestionSerializer(serializers.ModelSerializer):
    """Owner-facing serializer. Includes which options are correct."""

    options = AnswerOptionSerializer(many=True)
    quiz_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Question
        fields = [
            "id",
            "quiz_id",
            "text",
            "question_type",
            "image",
            "points",
            "order",
            "explanation",
            "options",
        ]
        read_only_fields = ["id"]

    def validate_text(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Question text cannot be empty.")
        return value

    def validate(self, data):
        question_type = data.get("question_type", getattr(self.instance, "question_type", "multiple_choice"))
        options = data.get("options")
        if options is None and self.instance is not None:
            options = list(self.instance.options.all())
        options = options or []

        max_options = max_options_for(question_type)
        if len(options) < MIN_OPTIONS:
            raise serializers.ValidationError(
                {"options": f"{question_type} questions require at least {MIN_OPTIONS} options."}
            )
        if len(options) > max_options:
            raise serializers.ValidationError(
                {"options": f"{question_type} questions support at most {max_options} options."}
            )
        if not any(option.get("is_correct") for option in options if isinstance(option, dict)):
            # Existing model instances always carry a boolean.
            if not any(getattr(option, "is_correct", False) for option in options):
                raise serializers.ValidationError(
                    {"options": "Mark at least one option as correct."}
                )

        if question_type == "true_false" and len(options) != 2:
            raise serializers.ValidationError({"options": "True/False questions need exactly 2 options."})

        return data

    def create(self, validated_data):
        options_data = validated_data.pop("options", [])
        validated_data.pop("quiz_id", None)
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            option_data.pop("id", None)
            AnswerOption.objects.create(question=question, **option_data)
        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop("options", None)
        validated_data.pop("quiz_id", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if options_data is not None:
            existing = {option.id: option for option in instance.options.all()}
            kept_ids = set()

            for option_data in options_data:
                option_id = option_data.pop("id", None)
                option = existing.get(option_id)
                if option is not None:
                    for attr, value in option_data.items():
                        setattr(option, attr, value)
                    option.save()
                    kept_ids.add(option_id)
                else:
                    created = AnswerOption.objects.create(question=instance, **option_data)
                    kept_ids.add(created.id)

            # Only remove options the owner actually deleted, so historical
            # answer selections survive ordinary edits.
            instance.options.exclude(id__in=kept_ids).delete()

        return instance


class QuestionPlaySerializer(serializers.ModelSerializer):
    """Taker-facing serializer. Never exposes correct answers or explanations."""

    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "text", "question_type", "image", "points", "order", "options"]

    def get_options(self, obj):
        return [{"id": opt.id, "text": opt.text, "order": opt.order} for opt in obj.options.all()]


# ---------------------------------------------------------------------------
# Quizzes
# ---------------------------------------------------------------------------


class QuizListSerializer(serializers.ModelSerializer):
    host_username = serializers.CharField(source="host.username", read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "code",
            "category",
            "status",
            "host_username",
            "time_limit",
            "created_at",
            "question_count",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()


class QuizSerializer(serializers.ModelSerializer):
    """Owner-facing quiz serializer with full question data."""

    host = UserSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    max_score = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "host",
            "title",
            "description",
            "code",
            "category",
            "status",
            "time_limit",
            "show_correct_answers",
            "allow_retake",
            "created_at",
            "updated_at",
            "questions",
            "question_count",
            "max_score",
        ]
        read_only_fields = ["id", "code", "created_at", "updated_at"]

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_max_score(self, obj):
        return sum(obj.questions.values_list("points", flat=True))


class QuizPlaySerializer(serializers.ModelSerializer):
    """Public, taker-facing quiz payload."""

    questions = QuestionPlaySerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    host_username = serializers.CharField(source="host.username", read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "code",
            "category",
            "time_limit",
            "show_correct_answers",
            "allow_retake",
            "host_username",
            "question_count",
            "questions",
        ]

    def get_question_count(self, obj):
        return obj.questions.count()


class QuizCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "category",
            "status",
            "time_limit",
            "show_correct_answers",
            "allow_retake",
        ]
        # Publishing is only possible through the validated `publish` action.
        read_only_fields = ["id", "status"]

    def validate_title(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Give your quiz a title.")
        if len(value) > 200:
            raise serializers.ValidationError("Titles cannot exceed 200 characters.")
        return value

    def validate_time_limit(self, value):
        if value is not None and value > 86400:
            raise serializers.ValidationError("Time limits cannot exceed 24 hours.")
        return value


# ---------------------------------------------------------------------------
# Results
# ---------------------------------------------------------------------------


class UserAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.text", read_only=True)
    selected_option_ids = serializers.SerializerMethodField()

    class Meta:
        model = UserAnswer
        fields = ["id", "question", "question_text", "selected_option_ids", "is_correct", "answered_at"]

    def get_selected_option_ids(self, obj):
        return list(obj.selected_options.values_list("id", flat=True))


class QuizResultSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    quiz = QuizListSerializer(read_only=True)
    answers = UserAnswerSerializer(many=True, read_only=True)
    percentage = serializers.SerializerMethodField()
    max_score = serializers.SerializerMethodField()
    correct_answers = serializers.SerializerMethodField()

    class Meta:
        model = QuizResult
        fields = [
            "id",
            "user",
            "quiz",
            "score",
            "total_questions",
            "max_score",
            "correct_answers",
            "percentage",
            "time_taken",
            "completed_at",
            "answers",
        ]
        read_only_fields = ["id", "completed_at"]

    def get_max_score(self, obj):
        return sum(obj.quiz.questions.values_list("points", flat=True))

    def get_correct_answers(self, obj):
        return obj.answers.filter(is_correct=True).count()

    def get_percentage(self, obj):
        max_score = self.get_max_score(obj)
        if max_score <= 0:
            return 0
        return round((obj.score / max_score) * 100, 2)


class AnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(min_value=1)
    selected_option_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )

    def validate_selected_option_ids(self, value):
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Duplicate option IDs are not allowed.")
        return value


class QuizSubmissionSerializer(serializers.Serializer):
    quiz_code = serializers.CharField(max_length=8)
    answers = AnswerSubmissionSerializer(many=True, allow_empty=False)
    time_taken = serializers.IntegerField(required=False, allow_null=True, min_value=0)

    def validate_quiz_code(self, value):
        value = value.strip().upper()
        if not Quiz.objects.filter(code=value, status="published").exists():
            raise serializers.ValidationError("Invalid quiz code or quiz is not published.")
        return value
