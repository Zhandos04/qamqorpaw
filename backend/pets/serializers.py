from rest_framework import serializers
from .models import Pet, PetPhoto, Breed, PetReport, PetReportPhoto

class BreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Breed
        fields = ['id', 'name', 'pet_type']

class PetPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetPhoto
        fields = ['id', 'image', 'is_primary', 'created_at']

class PetSerializer(serializers.ModelSerializer):
    photos = PetPhotoSerializer(many=True, read_only=True)
    breed_name = serializers.StringRelatedField(source='breed', read_only=True)
    city_name = serializers.StringRelatedField(source='city', read_only=True)
    shelter_name = serializers.StringRelatedField(source='shelter', read_only=True)
    is_favorite = serializers.SerializerMethodField()
    
    class Meta:
        model = Pet
        fields = [
            'id', 'name', 'is_stray', 'breed', 'breed_name', 'pet_type', 
            'age', 'gender', 'size', 'color', 'behavior',
            'vaccinated', 'sterilized', 'price', 'availability',
            'city', 'city_name', 'shelter', 'shelter_name',
            'owner', 'description', 'photos', 'is_favorite',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'favorited_by', 'is_favorite']
    
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(id=request.user.id).exists()
        return False

class PetDetailSerializer(PetSerializer):
    breed = BreedSerializer(read_only=True)
    
    class Meta(PetSerializer.Meta):
        pass

class PetCreateUpdateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Pet
        fields = [
            'name', 'is_stray', 'breed', 'pet_type', 
            'age', 'gender', 'size', 'color', 'behavior',
            'vaccinated', 'sterilized', 'price', 'availability',
            'city', 'shelter', 'description', 'photos'
        ]
    
    def create(self, validated_data):
        photos_data = validated_data.pop('photos', [])
        
        # Set owner to current user if creating a pet
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['owner'] = request.user
        
        pet = Pet.objects.create(**validated_data)
        
        # Create pet photos
        for i, photo_data in enumerate(photos_data):
            PetPhoto.objects.create(
                pet=pet,
                image=photo_data,
                is_primary=(i == 0)  # First photo is primary
            )
        
        return pet
    
    def update(self, instance, validated_data):
        photos_data = validated_data.pop('photos', [])
        
        # Update pet instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new photos
        if photos_data:
            # If there are existing photos and new photos are being added
            existing_photos = instance.photos.exists()
            
            for i, photo_data in enumerate(photos_data):
                PetPhoto.objects.create(
                    pet=instance,
                    image=photo_data,
                    is_primary=(not existing_photos and i == 0)  # Only set as primary if no existing photos
                )
        
        return instance

class PetReportPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetReportPhoto
        fields = ['id', 'image', 'created_at']

class PetReportSerializer(serializers.ModelSerializer):
    photos = PetReportPhotoSerializer(many=True, read_only=True)
    breed_name = serializers.StringRelatedField(source='breed', read_only=True)
    city_name = serializers.StringRelatedField(source='city', read_only=True)
    reporter_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PetReport
        fields = [
            'id', 'pet_type', 'breed', 'breed_name', 'name', 'is_stray',
            'age', 'color', 'gender', 'size', 'behavior',
            'city', 'city_name', 'street', 'location_details',
            'vaccinated', 'sterilized', 'reporter', 'reporter_name',
            'status', 'description', 'photos',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['reporter', 'reporter_name', 'status']
    
    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.get_full_name() or obj.reporter.username
        return None

class PetReportCreateUpdateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = PetReport
        fields = [
            'pet_type', 'breed', 'name', 'is_stray',
            'age', 'color', 'gender', 'size', 'behavior',
            'city', 'street', 'location_details',
            'vaccinated', 'sterilized', 'description', 'photos'
        ]
    
    def create(self, validated_data):
        photos_data = validated_data.pop('photos', [])
        
        # Set reporter to current user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['reporter'] = request.user
        
        pet_report = PetReport.objects.create(**validated_data)
        
        # Create pet report photos
        for photo_data in photos_data:
            PetReportPhoto.objects.create(
                report=pet_report,
                image=photo_data
            )
        
        return pet_report
    
class PetReportCreateUpdateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    existing_photos = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = PetReport
        fields = [
            'pet_type', 'breed', 'name', 'is_stray',
            'age', 'color', 'gender', 'size', 'behavior',
            'price', 'availability',
            'city', 'street', 'location_details',
            'vaccinated', 'sterilized', 'description', 
            'photos', 'existing_photos'
        ]
    
    def create(self, validated_data):
        photos_data = validated_data.pop('photos', [])
        
        # Set reporter to current user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['reporter'] = request.user
        
        pet_report = PetReport.objects.create(**validated_data)
        
        # Create pet report photos
        for photo_data in photos_data:
            PetReportPhoto.objects.create(
                report=pet_report,
                image=photo_data
            )
        
        return pet_report
    
    def update(self, instance, validated_data):
        photos_data = validated_data.pop('photos', [])
        existing_photos = validated_data.pop('existing_photos', [])
        
        # Update pet report instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Save with existing_photos to handle photo management
        instance.save(existing_photos=existing_photos)
        
        # Add new photos
        for photo_data in photos_data:
            PetReportPhoto.objects.create(
                report=instance,
                image=photo_data
            )
        
        return instance