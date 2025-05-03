from django.contrib import admin
from .models import City, Shelter, ShelterPhoto

class ShelterPhotoInline(admin.TabularInline):
    model = ShelterPhoto
    extra = 1

@admin.register(Shelter)
class ShelterAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'shelter_type', 'is_verified', 'owner')
    list_filter = ('shelter_type', 'is_verified', 'city')
    search_fields = ('name', 'description', 'city__name')
    inlines = [ShelterPhotoInline]

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')
    search_fields = ('name',)