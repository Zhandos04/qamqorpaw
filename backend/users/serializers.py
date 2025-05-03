from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile
from pets.serializers import PetSerializer
from shelters.serializers import ShelterSerializer

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    city_name = serializers.StringRelatedField(source='city', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'phone', 'photo', 'city', 'city_name',
            'is_shelter_owner', 'is_clinic_owner',
            'created_at', 'updated_at'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'profile', 'date_joined', 'last_login'
        ]
        read_only_fields = ['date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return obj.get_full_name()

class UserUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'profile']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile instance
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return instance

class UserWithPetsSerializer(UserSerializer):
    owned_pets = PetSerializer(many=True, read_only=True)
    favorite_pets = PetSerializer(many=True, read_only=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['owned_pets', 'favorite_pets']

class UserWithSheltersSerializer(UserSerializer):
    owned_shelters = ShelterSerializer(many=True, read_only=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['owned_shelters']

class UserDetailSerializer(UserSerializer):
    owned_pets = PetSerializer(many=True, read_only=True)
    favorite_pets = PetSerializer(many=True, read_only=True)
    owned_shelters = ShelterSerializer(many=True, read_only=True)
    pet_reports = serializers.SerializerMethodField()
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'owned_pets', 'favorite_pets', 'owned_shelters', 'pet_reports'
        ]
    
    def get_pet_reports(self, obj):
        from pets.serializers import PetReportSerializer
        return PetReportSerializer(obj.pet_reports.all(), many=True, context=self.context).data