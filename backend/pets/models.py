from django.db import models
from django.contrib.auth import get_user_model
from shelters.models import Shelter, City

User = get_user_model()

class PetType(models.TextChoices):
    DOG = 'dog', 'Dog'
    CAT = 'cat', 'Cat'

class PetGender(models.TextChoices):
    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'

class PetSize(models.TextChoices):
    SMALL = 'small', 'Small'
    MEDIUM = 'medium', 'Medium'
    LARGE = 'large', 'Large'

class PetBehavior(models.TextChoices):
    FRIENDLY = 'friendly', 'Friendly'
    ACTIVE = 'active', 'Active'
    CALM = 'calm', 'Calm'
    PLAYFUL = 'playful', 'Playful'

class PetAvailability(models.TextChoices):
    FOR_ADOPTION = 'for_adoption', 'For Adoption'
    FOSTER_NEEDED = 'foster_needed', 'Foster Needed'
    PRIVATE_OWNER = 'private_owner', 'Private Owner'
    SHELTER = 'shelter', 'Shelter'

class Breed(models.Model):
    name = models.CharField(max_length=100)
    pet_type = models.CharField(max_length=10, choices=PetType.choices)
    
    def __str__(self):
        return self.name

class Pet(models.Model):
    name = models.CharField(max_length=100)
    is_stray = models.BooleanField(default=False)
    breed = models.ForeignKey(Breed, on_delete=models.SET_NULL, null=True, blank=True)
    pet_type = models.CharField(max_length=10, choices=PetType.choices)
    age = models.PositiveIntegerField(null=True, blank=True)  # In months
    gender = models.CharField(max_length=10, choices=PetGender.choices)
    size = models.CharField(max_length=10, choices=PetSize.choices)
    color = models.CharField(max_length=50)
    behavior = models.CharField(max_length=20, choices=PetBehavior.choices)
    
    # Health details
    vaccinated = models.BooleanField(default=False)
    sterilized = models.BooleanField(default=False)
    
    # Adoption details
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability = models.CharField(max_length=20, choices=PetAvailability.choices)
    
    # Location
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Relationships
    shelter = models.ForeignKey(Shelter, on_delete=models.SET_NULL, null=True, blank=True, related_name='pets')
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_pets')
    favorited_by = models.ManyToManyField(User, related_name='favorite_pets', blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name
    
    @property
    def is_free(self):
        return self.price is None or self.price == 0

class PetPhoto(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='pets/photos/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo of {self.pet.name}"

class PetReport(models.Model):
    class ReportStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        RESOLVED = 'resolved', 'Resolved'
        DELETED = 'deleted', 'Deleted'
    
    # Pet details
    pet_type = models.CharField(max_length=10, choices=PetType.choices)
    breed = models.ForeignKey(Breed, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)
    is_stray = models.BooleanField(default=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    color = models.CharField(max_length=50, blank=True)
    gender = models.CharField(max_length=10, choices=PetGender.choices, null=True, blank=True)
    size = models.CharField(max_length=10, choices=PetSize.choices, null=True, blank=True)
    behavior = models.CharField(max_length=20, choices=PetBehavior.choices, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability = models.CharField(
        max_length=20, 
        choices=PetAvailability.choices, 
        default=PetAvailability.FOR_ADOPTION
    )
    
    # Location details
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True)
    street = models.CharField(max_length=255, blank=True)
    location_details = models.CharField(max_length=255, blank=True)
    
    # Health details
    vaccinated = models.BooleanField(null=True, blank=True)
    sterilized = models.BooleanField(null=True, blank=True)
    
    # Report metadata
    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='pet_reports')
    status = models.CharField(max_length=20, choices=ReportStatus.choices, default=ReportStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"Report {self.id} - {self.pet_type}"
    
    def save(self, *args, **kwargs):
        # If this is an update of an existing report, handle existing photos
        if 'existing_photos' in kwargs:
            existing_photos = kwargs.pop('existing_photos')
            
            # Delete photos that are not in the list to keep
            if self.pk:
                self.photos.exclude(id__in=existing_photos).delete()
        
        super().save(*args, **kwargs)

class PetReportPhoto(models.Model):
    report = models.ForeignKey(PetReport, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='reports/photos/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo for report {self.report.id}"
    
    def delete(self, *args, **kwargs):
        # Delete the file from storage when the object is deleted
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)