
# 🧠 Quiz Mania

**Quiz Mania** is a simple Django-based web application that lets users create quizzes, play them, and view evaluation results. Built as a fun test project to explore Django’s capabilities, it supports multiple users and uses Django’s built-in authentication system.

---

## ✨ Features

- ✅ Create quizzes with multiple questions
- ✅ Play quizzes as a logged-in user
- ✅ Automatic evaluation of answers
- ✅ Results are shown to both the quiz creator and the player
- ✅ Supports multiple users with Django's user profile system

---

## 🛠️ Tech Stack

- **Framework:** Django
- **Database:** SQLite (default Django setup)
- **Language:** Python

---

## 🚀 Running the Project Locally

```bash
git clone https://github.com/yourusername/quiz-mania.git
cd quiz-mania
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
````

Then go to:

```
http://127.0.0.1:8000
```

---

## 🙋‍♂️ About

This was a **test project built for learning** Django and understanding user-based workflows like quiz creation, access control, and result management.

---
