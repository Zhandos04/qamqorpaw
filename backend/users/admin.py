from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_shelter_owner', 'is_clinic_owner')
    
    def is_shelter_owner(self, obj):
        return obj.profile.is_shelter_owner
    is_shelter_owner.boolean = True
    is_shelter_owner.short_description = 'Shelter Owner'
    
    def is_clinic_owner(self, obj):
        return obj.profile.is_clinic_owner
    is_clinic_owner.boolean = True
    is_clinic_owner.short_description = 'Clinic Owner'

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)