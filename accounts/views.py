import json

from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.tokens import RefreshToken

from api.serializers import UserRegistrationSerializer


def _wants_json(request):
    content_type = request.headers.get("Content-Type", "")
    accept = request.META.get("HTTP_ACCEPT", "")
    return "application/json" in content_type or accept.startswith("application/json")


@require_http_methods(["GET", "POST"])
def register(request):
    """Register a user for both the legacy template flow and JSON clients."""
    if request.method == "POST" and _wants_json(request):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        serializer = UserRegistrationSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return JsonResponse(
                {
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    },
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                },
                status=201,
            )
        return JsonResponse(serializer.errors, status=400)

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
        return render(request, "register.html", {"form": form})

    if _wants_json(request):
        return JsonResponse({"message": "POST username, email, password and password2."})
    return render(request, "register.html", {"form": UserCreationForm()})


@login_required
def profile(request):
    if _wants_json(request):
        return JsonResponse(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
            }
        )
    return render(request, "profile.html", {"user": request.user})


@require_http_methods(["GET", "POST"])
def logout(request):
    """Logout for template sessions and JSON/JWT clients."""
    if request.method == "POST":
        refresh_token = request.POST.get("refresh")
        if not refresh_token:
            try:
                refresh_token = json.loads(request.body or "{}").get("refresh")
            except (json.JSONDecodeError, AttributeError):
                refresh_token = None

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        auth_logout(request)
        return JsonResponse({"message": "Successfully logged out."})

    auth_logout(request)
    return redirect("login")
