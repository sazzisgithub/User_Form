from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import UserDetail
from .serializers import UserDetailSerializer

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
        user = UserDetail.objects.get(userId=user_id)

        serializer = UserDetailSerializer(user)
        return Response(serializer.data)
    except UserDetail.DoesNotExist:
        return Response({"error": "User not found"}, status=404)



@api_view(['GET'])
def get_users(request):
    users = UserDetail.objects.all()
    serializer = UserDetailSerializer(users, many=True)
    return Response(serializer.data)

