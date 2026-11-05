web: python manage.py migrate --noinput && gunicorn Quiz_mania.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120
