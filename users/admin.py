# users/admin.py
from django.contrib import admin
from .models import UserDetail, UserVerification

@admin.register(UserDetail)
class UserDetailAdmin(admin.ModelAdmin):
    list_display = ('name', 'userId', 'email', 'phone')
    readonly_fields = ('userId',)

@admin.register(UserVerification)
class UserVerificationAdmin(admin.ModelAdmin):
    list_display = ('user','status', 'verifier', 'reason', 'timestamp')
    readonly_fields = ('user',)
