from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('create_quiz/', views.create_quiz, name='create_quiz'),
    path('quiz-created/<int:quiz_id>/', views.quiz_created, name='quiz_created'),
    path('join_quiz/', views.join_quiz, name='join_quiz'),
    path('play/<str:code>/', views.play_quiz, name='play_quiz'),
    path('submit/<str:code>/', views.submit_quiz, name='submit_quiz'),
    path('my-quizzes/', views.hosted_quizzes, name='hosted_quizzes'),
    path('results/<int:quiz_id>/', views.quiz_results, name='quiz_results'),

]


