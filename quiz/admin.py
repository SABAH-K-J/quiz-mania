from django.contrib import admin
from .models import Quiz, Question, AnswerOption, QuizResult, UserAnswer


class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 2


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'host', 'code', 'status', 'category', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['title', 'code', 'host__username']
    readonly_fields = ['code', 'created_at', 'updated_at']
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'text', 'question_type', 'points', 'order']
    list_filter = ['question_type', 'quiz']
    search_fields = ['text', 'quiz__title']
    inlines = [AnswerOptionInline]


@admin.register(AnswerOption)
class AnswerOptionAdmin(admin.ModelAdmin):
    list_display = ['question', 'text', 'is_correct', 'order']
    list_filter = ['is_correct']


@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'score', 'total_questions', 'percentage', 'completed_at']
    list_filter = ['quiz', 'completed_at']
    search_fields = ['user__username', 'quiz__title']
    readonly_fields = ['completed_at']


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ['quiz_result', 'question', 'is_correct', 'answered_at']
    list_filter = ['is_correct', 'answered_at']

