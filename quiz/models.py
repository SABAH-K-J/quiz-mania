from django.db import models
from django.contrib.auth.models import User
import string
import random

class Quiz(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    CATEGORY_CHOICES = [
        ('general', 'General Knowledge'),
        ('science', 'Science'),
        ('math', 'Mathematics'),
        ('history', 'History'),
        ('geography', 'Geography'),
        ('technology', 'Technology'),
        ('sports', 'Sports'),
        ('entertainment', 'Entertainment'),
        ('other', 'Other'),
    ]
    
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    code = models.CharField(max_length=8, unique=True, editable=False)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    time_limit = models.PositiveIntegerField(
        null=True, 
        blank=True, 
        help_text="Time limit in seconds (null for no limit)"
    )
    show_correct_answers = models.BooleanField(default=True)
    allow_retake = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Quizzes"
        ordering = ['-created_at']

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_unique_code()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_unique_code():
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not Quiz.objects.filter(code=code).exists():
                return code


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('multi_select', 'Multiple Select'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    image = models.ImageField(upload_to='question_images/', blank=True, null=True)
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    explanation = models.TextField(blank=True, null=True, help_text="Explanation shown after answer")

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.quiz.title} - {self.text[:50]}"


class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.question.text[:30]} - {self.text[:30]}"


class QuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_results')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='results')
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    time_taken = models.PositiveIntegerField(null=True, blank=True, help_text="Time taken in seconds")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']
        unique_together = []  # Removed unique constraint to allow retakes

    @property
    def percentage(self):
        if self.total_questions == 0:
            return 0
        return round((self.score / self.total_questions) * 100, 2)

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} ({self.score}/{self.total_questions})"


class UserAnswer(models.Model):
    """Stores individual answers from users"""
    quiz_result = models.ForeignKey(QuizResult, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_options = models.ManyToManyField(AnswerOption, related_name='user_selections')
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quiz_result.user.username} - {self.question.text[:30]}"