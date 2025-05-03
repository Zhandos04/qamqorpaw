import django_filters
from .models import Pet, PetReport

class PetFilter(django_filters.FilterSet):
    min_age = django_filters.NumberFilter(field_name='age', lookup_expr='gte')
    max_age = django_filters.NumberFilter(field_name='age', lookup_expr='lte')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    is_free = django_filters.BooleanFilter(method='filter_is_free')
    
    class Meta:
        model = Pet
        fields = {
            'pet_type': ['exact'],
            'breed': ['exact'],
            'gender': ['exact'],
            'size': ['exact'],
            'color': ['icontains'],
            'behavior': ['exact'],
            'vaccinated': ['exact'],
            'sterilized': ['exact'],
            'city': ['exact'],
            'availability': ['exact'],
            'shelter': ['exact'],
        }
    
    def filter_is_free(self, queryset, name, value):
        if value:
            return queryset.filter(price__isnull=True) | queryset.filter(price=0)
        return queryset

class PetReportFilter(django_filters.FilterSet):
    min_age = django_filters.NumberFilter(field_name='age', lookup_expr='gte')
    max_age = django_filters.NumberFilter(field_name='age', lookup_expr='lte')
    
    class Meta:
        model = PetReport
        fields = {
            'pet_type': ['exact'],
            'breed': ['exact'],
            'gender': ['exact'],
            'size': ['exact'],
            'color': ['icontains'],
            'behavior': ['exact'],
            'vaccinated': ['exact'],
            'sterilized': ['exact'],
            'city': ['exact'],
            'status': ['exact'],
        }