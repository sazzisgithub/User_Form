# users/urls.py (append new paths)
from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit_form),
    path('users/', views.get_users),
    path('user/<str:user_id>/', views.get_user_by_id),

    # New endpoints:
    path('user/<str:user_id>/verify/', views.verify_user),
    path('user/<str:user_id>/reject/', views.reject_user),
    path('users/verified/', views.get_verified_users),
    path('users/rejected/', views.get_rejected_users),
    path("user/<str:user_id>/delete/", views.delete_user, name="delete_user"),
]
