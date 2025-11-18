# users/admin.py
from django.contrib import admin
from .models import UserDetail

@admin.register(UserDetail)
class UserDetailAdmin(admin.ModelAdmin):
    list_display = ('name', 'userId', 'email', 'phone')
    readonly_fields = ('userId',)
