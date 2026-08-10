# Quiz Mania 🎯

A modern, full-stack quiz application built with Django REST Framework and React. Create interactive quizzes, track results, and analyze performance with comprehensive analytics.

![Django](https://img.shields.io/badge/Django-5.2.11-green)
![React](https://img.shields.io/badge/React-18-blue)
![DRF](https://img.shields.io/badge/DRF-3.16.1-orange)

## ✨ Features

### For Quiz Creators
- 🎨 **Dynamic Quiz Builder** - Create quizzes with 2-6 answer options per question
- 📊 **Analytics Dashboard** - View detailed statistics on who took your quiz
- 🏆 **Leaderboards** - See top performers with rankings and scores
- ⏱️ **Time Limits** - Set optional time limits for quizzes
- 📂 **Categories** - Organize quizzes by subject
- 🔒 **Draft Mode** - Save and edit before publishing

### For Quiz Takers
- 🎮 **Interactive Quiz Player** - Real-time countdown timer
- 📈 **Personal Analytics** - Track your performance over time
- 🏅 **Performance Metrics** - Grade emojis, score trends, and charts
- 🔄 **Retake Options** - Practice makes perfect

### Technical Features
- 🔐 **JWT Authentication** - Secure token-based auth with refresh tokens
- 🌐 **RESTful API** - Clean, well-documented API endpoints
- 🎨 **Modern UI** - Built with Tailwind CSS
- 🐳 **Docker Ready** - Containerized deployment setup 

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/quiz-mania.git
cd quiz-mania

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

Backend will run on `http://127.0.0.1:8000`

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎮 Usage

### Creating a Quiz
1. Register/Login to your account
2. Click "Create Quiz" in the navigation
3. Fill in quiz details and add questions
4. Save as draft or publish immediately

### Taking a Quiz
1. Get the quiz code from the creator
2. Click "Join a Quiz" and enter the code
3. Answer questions and view your results

### Viewing Analytics
- **Creators**: Dashboard → Click the purple chart icon on your quiz
- **Takers**: Navbar → "My Results"

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
