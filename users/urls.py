from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit_form),
    path('users/', views.get_users),
    path('user/<str:user_id>/', views.get_user_by_id),
]
