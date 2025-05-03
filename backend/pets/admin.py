from django.contrib import admin
from .models import Breed, Pet, PetPhoto, PetReport, PetReportPhoto

class PetPhotoInline(admin.TabularInline):
    model = PetPhoto
    extra = 1

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('name', 'breed', 'pet_type', 'gender', 'age', 'price', 'availability')
    list_filter = ('pet_type', 'gender', 'availability', 'vaccinated', 'sterilized')
    search_fields = ('name', 'breed__name', 'description')
    inlines = [PetPhotoInline]

@admin.register(Breed)
class BreedAdmin(admin.ModelAdmin):
    list_display = ('name', 'pet_type')
    list_filter = ('pet_type',)
    search_fields = ('name',)

class PetReportPhotoInline(admin.TabularInline):
    model = PetReportPhoto
    extra = 1

@admin.register(PetReport)
class PetReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'pet_type', 'breed', 'city', 'status', 'created_at')
    list_filter = ('pet_type', 'status', 'city')
    search_fields = ('description', 'breed__name')
    inlines = [PetReportPhotoInline]