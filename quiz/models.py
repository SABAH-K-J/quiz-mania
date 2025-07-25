from django.db import models
from django.contrib.auth.models import User

class Quiz(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=8, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    text = models.TextField()
    option1 = models.CharField(max_length=255)
    option2 = models.CharField(max_length=255)
    option3 = models.CharField(max_length=255)
    option4 = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class QuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)

    @property
    def percentage(self):
        return (self.score / self.total_questions) * 100

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} ({self.score}/{self.total_questions})"