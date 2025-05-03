from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner or staff
        if hasattr(obj, 'owner'):
            return obj.owner == request.user or request.user.is_staff
        elif hasattr(obj, 'user'):
            return obj.user == request.user or request.user.is_staff
        else:
            return obj == request.user or request.user.is_staff