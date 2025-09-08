from rest_framework.permissions import BasePermission

class IsVendor(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        if not u.is_authenticated:
            return False
        role = getattr(getattr(u, 'profile', None), 'role', None)
        return role == 'vendor' or u.is_superuser

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u.is_authenticated and (u.is_superuser or getattr(getattr(u,'profile',None),'role',None)=='superadmin'))

class IsOpsOrAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        if not u.is_authenticated:
            return False
        role = getattr(getattr(u,'profile',None),'role',None)
        return role in ('ops','superadmin') or u.is_superuser
