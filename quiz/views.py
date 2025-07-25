from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .models import Quiz, Question , QuizResult
import random
import string


# Create your views here.

def index(request):
    return render(request, 'index.html')

@login_required
def dashboard(request):
    created_quizzes = Quiz.objects.filter(host=request.user).order_by('-created_at')
    attended_quizzes = QuizResult.objects.filter(user=request.user).select_related('quiz').order_by('-completed_at')

    context = {
        'created_quizzes': created_quizzes,
        'attended_quizzes': attended_quizzes,
    }
    return render(request, 'dashboard.html', context)




def generate_unique_code(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@login_required
def create_quiz(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')  # optional field
        host = request.user

        code = generate_unique_code()
        while Quiz.objects.filter(code=code).exists():
            code = generate_unique_code()

        quiz = Quiz.objects.create(host=host, title=title, code=code)

        # Parse questions
        question_num = 1
        while f'question_{question_num}' in request.POST:
            q_text = request.POST.get(f'question_{question_num}')
            option1 = request.POST.get(f'option_{question_num}_a')
            option2 = request.POST.get(f'option_{question_num}_b')
            option3 = request.POST.get(f'option_{question_num}_c')
            option4 = request.POST.get(f'option_{question_num}_d')
            correct_letter = request.POST.get(f'correct_{question_num}')

            correct_answer = {
                'a': option1,
                'b': option2,
                'c': option3,
                'd': option4,
            }.get(correct_letter)

            Question.objects.create(
                quiz=quiz,
                text=q_text,
                option1=option1,
                option2=option2,
                option3=option3,
                option4=option4,
                correct_answer=correct_answer
            )

            question_num += 1

        return redirect(reverse('quiz_created', kwargs={'quiz_id': quiz.id}))

    return render(request, 'create_quiz.html')

@login_required
def quiz_created(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id, host=request.user)
    return render(request, 'quiz_created.html', {'quiz': quiz})


@login_required
def join_quiz(request):
    if request.method == 'POST':
        code = request.POST.get('code')
        return redirect('play_quiz', code=code)
    return render(request, 'quiz/join_quiz.html')

@login_required
def play_quiz(request, code):
    quiz = get_object_or_404(Quiz, code=code)
    questions = quiz.question_set.all()
    return render(request, 'quiz/play_quiz.html', {'quiz': quiz, 'questions': questions})

@login_required
def submit_quiz(request, code):
    quiz = get_object_or_404(Quiz, code=code)
    questions = quiz.question_set.all()
    score = 0

    for question in questions:
        user_answer = request.POST.get(f'question_{question.id}')
        if user_answer == question.correct_answer:
            score += 1

    QuizResult.objects.create(
        user=request.user,
        quiz=quiz,
        score=score,
        total_questions=questions.count()
    )

    return render(request, 'quiz/quiz_result.html', {
        'quiz': quiz,
        'score': score,
        'total': questions.count(),
        'percentage': round((score / questions.count()) * 100)
    })

@login_required
def hosted_quizzes(request):
    quizzes = Quiz.objects.filter(host=request.user)
    return render(request, 'quiz/hosted_quizzes.html', {'quizzes': quizzes})

@login_required
def quiz_results(request, quiz_id):
    quiz = get_object_or_404(Quiz, id=quiz_id, host=request.user)
    results = QuizResult.objects.filter(quiz=quiz).select_related('user')
    return render(request, 'quiz/quiz_results.html', {
        'quiz': quiz,
        'results': results
    })


