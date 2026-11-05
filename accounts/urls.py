from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Template-rendered auth views (legacy)
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.register, name='register'),

    # API endpoints (JSON)
    path('api/register/', views.register, name='api_register'),
    path('api/logout/', views.logout, name='api_logout'),
    path('api/profile/', views.profile, name='api_profile'),
]