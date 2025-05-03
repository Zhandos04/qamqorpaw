import django_filters
from .models import Shelter

class ShelterFilter(django_filters.FilterSet):
    class Meta:
        model = Shelter
        fields = {
            'shelter_type': ['exact'],
            'city': ['exact'],
            'is_verified': ['exact'],
        }