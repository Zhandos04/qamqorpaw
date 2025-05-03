from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class City(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Cities"

class ShelterType(models.TextChoices):
    SHELTER = 'shelter', 'Shelter'
    CLINIC = 'clinic', 'Clinic'
    BOTH = 'both', 'Both'

class Shelter(models.Model):
    name = models.CharField(max_length=255)
    shelter_type = models.CharField(max_length=10, choices=ShelterType.choices, default=ShelterType.SHELTER)
    description = models.TextField(blank=True)
    
    # Contact info
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    
    # Location
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True)
    street = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    
    # Relationships
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='owned_shelters')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class ShelterPhoto(models.Model):
    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='shelters/photos/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo of {self.shelter.name}"