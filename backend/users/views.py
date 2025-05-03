from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, UserUpdateSerializer, UserDetailSerializer
)
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_queryset(self):
        # Non-staff users can only see active users
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(is_active=True)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def favorite_pets(self, request):
        from pets.serializers import PetSerializer
        
        user = request.user
        favorite_pets = user.favorite_pets.all()
        
        page = self.paginate_queryset(favorite_pets)
        if page is not None:
            serializer = PetSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PetSerializer(favorite_pets, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def owned_pets(self, request):
        from pets.serializers import PetSerializer
        
        user = request.user
        owned_pets = user.owned_pets.all()
        
        page = self.paginate_queryset(owned_pets)
        if page is not None:
            serializer = PetSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PetSerializer(owned_pets, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pet_reports(self, request):
        from pets.serializers import PetReportSerializer
        
        user = request.user
        pet_reports = user.pet_reports.all()
        
        page = self.paginate_queryset(pet_reports)
        if page is not None:
            serializer = PetReportSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PetReportSerializer(pet_reports, many=True, context={'request': request})
        return Response(serializer.data)