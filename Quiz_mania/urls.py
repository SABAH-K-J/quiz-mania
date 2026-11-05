"""Quiz Mania API URL configuration.

The product frontend is a separate React SPA (deployed to Vercel). This
Django service only exposes the REST API, the admin and a health probe.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    """Lightweight readiness probe used by PaaS health checks and uptime monitors."""
    from django.db import connection

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        database = "ok"
        status = 200
    except Exception:  # pragma: no cover - only hit when the DB is unreachable
        database = "unavailable"
        status = 503

    return JsonResponse(
        {
            "status": "ok" if status == 200 else "error",
            "service": "quiz-mania-api",
            "database": database,
            "version": "1.0.0",
        },
        status=status,
    )


def api_root(request):
    return JsonResponse(
        {
            "service": "Quiz Mania API",
            "version": "1.0.0",
            "docs": request.build_absolute_uri("/api/"),
            "health": request.build_absolute_uri("/health/"),
            "admin": request.build_absolute_uri("/admin/"),
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health, name="health"),
    path("api/health/", health, name="api-health"),
    path("api/", include("api.urls")),
    path("", api_root, name="api-root"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
