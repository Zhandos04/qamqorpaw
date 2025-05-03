from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import Pet, Breed, PetReport
from .serializers import (
    PetSerializer, PetDetailSerializer, PetCreateUpdateSerializer,
    BreedSerializer, PetReportSerializer, PetReportCreateUpdateSerializer
)
from .filters import PetFilter, PetReportFilter
from .permissions import IsReporterOrReadOnly

class PetReportViewSet(viewsets.ModelViewSet):
    queryset = PetReport.objects.all().select_related('breed', 'city', 'reporter')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PetReportFilter
    search_fields = ['name', 'breed__name', 'description']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticatedOrReadOnly, IsReporterOrReadOnly]
    
    def get_queryset(self):
        return PetReport.objects.exclude(status='deleted')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PetReportCreateUpdateSerializer
        return PetReportSerializer
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Extract existing_photos if provided
        existing_photos = request.data.get('existing_photos', [])
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Pass existing_photos to save method
        serializer.save(existing_photos=existing_photos)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_reports(self, request):
        """Get all reports created by the current user"""
        user = request.user
        reports = PetReport.objects.filter(reporter=user).exclude(status='deleted')
        
        page = self.paginate_queryset(reports)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_status(self, request, pk=None):
        """Change the status of a report"""
        pet_report = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in dict(PetReport.ReportStatus.choices):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is staff or the reporter
        user = request.user
        if not (user.is_staff or pet_report.reporter == user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        pet_report.status = new_status
        pet_report.save()
        
        serializer = self.get_serializer(pet_report)
        return Response(serializer.data)

class BreedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Breed.objects.all()
    serializer_class = BreedSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['pet_type']
    search_fields = ['name']

class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all().select_related('breed', 'city', 'shelter', 'owner')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PetFilter
    search_fields = ['name', 'breed__name', 'description']
    ordering_fields = ['created_at', 'price', 'age']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PetDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PetCreateUpdateSerializer
        return PetSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        pet = self.get_object()
        user = request.user
        
        if pet.favorited_by.filter(id=user.id).exists():
            pet.favorited_by.remove(user)
            return Response({'status': 'removed from favorites'})
        else:
            pet.favorited_by.add(user)
            return Response({'status': 'added to favorites'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def favorites(self, request):
        user = request.user
        favorites = Pet.objects.filter(favorited_by=user)
        
        page = self.paginate_queryset(favorites)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_pets(self, request):
        user = request.user
        my_pets = Pet.objects.filter(owner=user)
        
        page = self.paginate_queryset(my_pets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(my_pets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        stats = {
            'total': Pet.objects.count(),
            'dogs': Pet.objects.filter(pet_type='dog').count(),
            'cats': Pet.objects.filter(pet_type='cat').count(),
            'for_adoption': Pet.objects.filter(availability='for_adoption').count(),
            'foster_needed': Pet.objects.filter(availability='foster_needed').count(),
        }
        return Response(stats)

class PetReportViewSet(viewsets.ModelViewSet):
    queryset = PetReport.objects.all().select_related('breed', 'city', 'reporter')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PetReportFilter
    search_fields = ['name', 'breed__name', 'description']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PetReportCreateUpdateSerializer
        return PetReportSerializer
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_reports(self, request):
        user = request.user
        my_reports = PetReport.objects.filter(reporter=user)
        
        page = self.paginate_queryset(my_reports)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(my_reports, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_status(self, request, pk=None):
        pet_report = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in dict(PetReport.ReportStatus.choices):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is staff or the reporter
        user = request.user
        if not (user.is_staff or pet_report.reporter == user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        pet_report.status = new_status
        pet_report.save()
        
        serializer = self.get_serializer(pet_report)
        return Response(serializer.data)