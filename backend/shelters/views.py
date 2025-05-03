from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Shelter, City
from .serializers import (
    ShelterSerializer, ShelterDetailSerializer, ShelterCreateUpdateSerializer,
    CitySerializer
)
from .filters import ShelterFilter

class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class ShelterViewSet(viewsets.ModelViewSet):
    queryset = Shelter.objects.all().select_related('city', 'owner')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ShelterFilter
    search_fields = ['name', 'description', 'city__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ShelterDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ShelterCreateUpdateSerializer
        return ShelterSerializer
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_shelters(self, request):
        user = request.user
        my_shelters = Shelter.objects.filter(owner=user)
        
        page = self.paginate_queryset(my_shelters)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(my_shelters, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        stats = {
            'total': Shelter.objects.count(),
            'shelters': Shelter.objects.filter(shelter_type='shelter').count(),
            'clinics': Shelter.objects.filter(shelter_type='clinic').count(),
            'both': Shelter.objects.filter(shelter_type='both').count(),
            'verified': Shelter.objects.filter(is_verified=True).count(),
        }
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def pets(self, request, pk=None):
        shelter = self.get_object()
        from pets.models import Pet
        from pets.serializers import PetSerializer
        
        pets = Pet.objects.filter(shelter=shelter)
        
        page = self.paginate_queryset(pets)
        if page is not None:
            serializer = PetSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PetSerializer(pets, many=True, context={'request': request})
        return Response(serializer.data)