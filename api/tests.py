from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from quiz.models import AnswerOption, Question, Quiz


@override_settings(ALLOWED_HOSTS=["testserver"])
class QuizApiTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner", email="owner@example.com", password="TestPass123!"
        )
        self.taker = User.objects.create_user(
            username="taker", email="taker@example.com", password="TestPass123!"
        )
        self.owner_client = APIClient()
        self.owner_client.force_authenticate(self.owner)
        self.taker_client = APIClient()
        self.taker_client.force_authenticate(self.taker)
        self.anon_client = APIClient()

    def make_quiz(self, status="draft"):
        quiz = Quiz.objects.create(host=self.owner, title="Space quiz", status=status)
        question = Question.objects.create(
            quiz=quiz,
            text="Which planet has the most moons?",
            question_type="multiple_choice",
            points=2,
            order=0,
        )
        correct = AnswerOption.objects.create(
            question=question, text="Saturn", is_correct=True, order=0
        )
        wrong = AnswerOption.objects.create(
            question=question, text="Mars", is_correct=False, order=1
        )
        return quiz, question, correct, wrong

    def test_quizzes_always_start_as_drafts(self):
        response = self.owner_client.post(
            "/api/quizzes/",
            {"title": "Fresh quiz", "status": "published"},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()["status"], "draft")

    def test_draft_is_not_public_but_publish_makes_it_playable(self):
        quiz, _, _, _ = self.make_quiz()

        response = self.anon_client.get(f"/api/quizzes/{quiz.code}/by_code/")
        self.assertEqual(response.status_code, 404)

        response = self.owner_client.post(f"/api/quizzes/{quiz.id}/publish/")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["status"], "published")

        response = self.anon_client.get(f"/api/quizzes/{quiz.code}/by_code/")
        self.assertEqual(response.status_code, 200, response.content)

    def test_publish_rejects_quiz_without_questions(self):
        quiz = Quiz.objects.create(host=self.owner, title="Empty quiz")
        response = self.owner_client.post(f"/api/quizzes/{quiz.id}/publish/")
        self.assertEqual(response.status_code, 400)

    def test_non_owner_cannot_publish(self):
        quiz, _, _, _ = self.make_quiz()
        response = self.taker_client.post(f"/api/quizzes/{quiz.id}/publish/")
        self.assertIn(response.status_code, (403, 404))

    def test_taker_payload_never_exposes_answers(self):
        quiz, _, _, _ = self.make_quiz(status="published")

        response = self.anon_client.get(f"/api/quizzes/{quiz.code}/by_code/")
        self.assertEqual(response.status_code, 200, response.content)
        payload = response.json()
        self.assertNotIn("is_correct", payload["questions"][0]["options"][0])
        self.assertNotIn("explanation", payload["questions"][0])

    def test_submission_scores_points_and_percentage(self):
        quiz, question, correct, wrong = self.make_quiz(status="published")

        response = self.taker_client.post(
            "/api/results/submit/",
            {
                "quiz_code": quiz.code,
                "answers": [
                    {"question_id": question.id, "selected_option_ids": [correct.id]}
                ],
                "time_taken": 12,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        result = response.json()
        self.assertEqual(result["score"], 2)
        self.assertEqual(result["max_score"], 2)
        self.assertEqual(result["percentage"], 100.0)
        self.assertEqual(result["correct_answers"], 1)

    def test_submission_rejects_options_from_another_question(self):
        quiz, question, _, _ = self.make_quiz(status="published")
        other_question = Question.objects.create(
            quiz=quiz, text="Other question", question_type="multiple_choice"
        )
        other_option = AnswerOption.objects.create(
            question=other_question, text="Not here", is_correct=True
        )

        response = self.taker_client.post(
            "/api/results/submit/",
            {
                "quiz_code": quiz.code,
                "answers": [
                    {"question_id": question.id, "selected_option_ids": [other_option.id]}
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_editing_options_keeps_existing_ids_and_new_options(self):
        _, question, correct, _ = self.make_quiz()

        response = self.owner_client.patch(
            f"/api/questions/{question.id}/",
            {
                "options": [
                    {"id": correct.id, "text": "Saturn", "is_correct": True, "order": 0},
                    {"text": "Neptune", "is_correct": False, "order": 1},
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)

        options = list(question.options.order_by("order"))
        self.assertEqual(len(options), 2, response.content)
        self.assertEqual(options[0].id, correct.id)
        self.assertEqual(options[0].text, "Saturn")
        self.assertEqual(options[1].text, "Neptune")
