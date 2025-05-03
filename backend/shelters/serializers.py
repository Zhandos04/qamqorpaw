from rest_framework import serializers
from .models import Shelter, ShelterPhoto, City

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'latitude', 'longitude']

class ShelterPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShelterPhoto
        fields = ['id', 'image', 'is_primary', 'created_at']

class ShelterSerializer(serializers.ModelSerializer):
    photos = ShelterPhotoSerializer(many=True, read_only=True)
    city_name = serializers.StringRelatedField(source='city', read_only=True)
    owner_name = serializers.SerializerMethodField()
    pet_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Shelter
        fields = [
            'id', 'name', 'shelter_type', 'description',
            'email', 'phone', 'website',
            'city', 'city_name', 'street', 'latitude', 'longitude',
            'is_verified', 'owner', 'owner_name', 'pet_count',
            'photos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'owner_name', 'is_verified', 'pet_count']
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.username
        return None
    
    def get_pet_count(self, obj):
        return obj.pets.count()

class ShelterDetailSerializer(ShelterSerializer):
    city = CitySerializer(read_only=True)
    
    class Meta(ShelterSerializer.Meta):
        pass

class ShelterCreateUpdateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Shelter
        fields = [
            'name', 'shelter_type', 'description',
            'email', 'phone', 'website',
            'city', 'street', 'latitude', 'longitude',
            'photos'
        ]
    
    def create(self, validated_data):
        photos_data = validated_data.pop('photos', [])
        
        # Set owner to current user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['owner'] = request.user
            
            # Update user profile to mark as shelter owner
            profile = request.user.profile
            if validated_data.get('shelter_type') == 'clinic':
                profile.is_clinic_owner = True
            elif validated_data.get('shelter_type') == 'both':
                profile.is_shelter_owner = True
                profile.is_clinic_owner = True
            else:
                profile.is_shelter_owner = True
            profile.save()
        
        shelter = Shelter.objects.create(**validated_data)
        
        # Create shelter photos
        for i, photo_data in enumerate(photos_data):
            ShelterPhoto.objects.create(
                shelter=shelter,
                image=photo_data,
                is_primary=(i == 0)  # First photo is primary
            )
        
        return shelter
    
    def update(self, instance, validated_data):
        photos_data = validated_data.pop('photos', [])
        
        # Update shelter instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new photos
        if photos_data:
            # If there are existing photos and new photos are being added
            existing_photos = instance.photos.exists()
            
            for i, photo_data in enumerate(photos_data):
                ShelterPhoto.objects.create(
                    shelter=instance,
                    image=photo_data,
                    is_primary=(not existing_photos and i == 0)  # Only set as primary if no existing photos
                )
        
        return instance