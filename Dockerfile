# Quiz Mania API — generic Docker image for Render, Koyeb, Railway, Fly.io, VPS, etc.
# The app binds to $PORT (Render/Koyeb set this automatically) and defaults to 8000.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# System dependencies (kept minimal; psycopg2 ships binary wheels).
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Build the static bundle used by the Django admin.
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn Quiz_mania.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --threads 4 --timeout 120 --access-logfile - --error-logfile -"]
