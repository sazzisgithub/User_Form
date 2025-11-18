# users/serializers.py
from rest_framework import serializers
from .models import UserDetail

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetail
        fields = ['userId', 'name', 'email', 'age', 'phone', 'address']
