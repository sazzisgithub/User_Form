from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import UserDetail, UserVerification
from .serializers import UserDetailSerializer, UserVerificationSerializer, UserVerificationCreateSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction

@api_view(['POST'])
def submit_form(request):
    serializer = UserDetailSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message":"Form submitted successfully!", "data": UserDetailSerializer(user).data}, status=201)
    print('Validation errors:', serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_user_by_id(request, user_id):
    try:
        user = UserDetail.objects.get(userId= user_id)

        serializer = UserDetailSerializer(user)
        return Response(serializer.data)
    except UserDetail.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

# @api_view(['GET'])
# def get_users(request):
#     users = UserDetail.objects.all()
#     serializer = UserDetailSerializer(users, many=True)
#     return Response(serializer.data)



@api_view(['GET'])
def get_users(request):
    filter_type = request.GET.get("type", "all")

    users = UserDetail.objects.select_related("verification").all()

    if filter_type == "pending":
        users = UserDetail.objects.filter(verification__isnull=True)

    elif filter_type == "verified":
        users = UserDetail.objects.filter(verification__status="verified")

    elif filter_type == "rejected":
        users = UserDetail.objects.filter(verification__status="rejected")

    # else:
    #     users = UserDetail.objects.all()

    serializer = UserDetailSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def verify_user(request, user_id):
    """
    Mark a user as verified. Request body: {"verifier":"Name"}
    """
    serializer = UserVerificationCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    verifier = serializer.validated_data['verifier']

    user = get_object_or_404(UserDetail, userId=user_id)

    # Create or update verification record
    with transaction.atomic():
        verification, created = UserVerification.objects.update_or_create(
            user=user,
            defaults={
                'status': 'verified',
                'verifier': verifier,
            }
        )

    out = UserVerificationSerializer(verification)
    return Response(out.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def reject_user(request, user_id):
    """
    Mark a user as rejected. Request body: {"verifier":"Name", "reason":"optional reason"}
    """
    serializer = UserVerificationCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    verifier = serializer.validated_data['verifier']
    reason = serializer.validated_data.get('reason', '')

    user = get_object_or_404(UserDetail, userId=user_id)

    with transaction.atomic():
        verification, created = UserVerification.objects.update_or_create(
            user=user,
            defaults={
                'status': 'rejected',
                'verifier': verifier,
                'reason': reason,
            }
        )

    out = UserVerificationSerializer(verification)
    return Response(out.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_verified_users(request):
    """
    Returns a list of users with verification.status == 'verified'
    """
    verifs = UserVerification.objects.filter(status='verified').select_related('user')
    serializer = UserVerificationSerializer(verifs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_rejected_users(request):
    """
    Returns a list of users with verification.status == 'rejected'
    """
    verifs = UserVerification.objects.filter(status='rejected').select_related('user')
    serializer = UserVerificationSerializer(verifs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_user(request, user_id):
    try:
        user = UserDetail.objects.get(userId=user_id)
        user.delete()
        return Response({"message": "User deleted successfully!"}, status=200)
    except UserDetail.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
