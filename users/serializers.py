# users/serializers.py
from rest_framework import serializers
from .models import UserDetail, UserVerification

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetail
        fields = ['userId', 'name', 'email', 'age', 'phone', 'address']


class UserVerificationSerializer(serializers.ModelSerializer):
    user = UserDetailSerializer(read_only=True)

    class Meta:
        model = UserVerification
        fields = ['user', 'status', 'verifier', 'reason', 'timestamp']

# Serializer for creating/updating a verification record (input)
class UserVerificationCreateSerializer(serializers.Serializer):
    verifier = serializers.CharField(max_length=100)
    reason = serializers.CharField(required=False, allow_blank=True)