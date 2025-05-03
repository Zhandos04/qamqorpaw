from rest_framework import permissions

class IsReporterOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow reporters of a pet report to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the reporter
        return obj.reporter == request.user or request.user.is_staff