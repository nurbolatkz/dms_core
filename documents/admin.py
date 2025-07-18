from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from documents.models import User, Document, Organization

# Register your custom User model
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Add 'department' and 'organization' to the fields displayed in the list view
    list_display = UserAdmin.list_display + ('department', 'organization',)
    
    # Add 'department' and 'organization' to the fields shown when adding/changing a user
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('department', 'organization',)}),
    )
    
    # If you want to filter users by department or organization in the admin list view
    list_filter = UserAdmin.list_filter + ('department', 'organization',)
    
    # If you want to search by department
    search_fields = UserAdmin.search_fields + ('department__icontains',) # __icontains for case-insensitive search

admin.site.register(Organization)
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'doc_type', 'status', 'creator')
    list_filter = ('doc_type', 'status')
    search_fields = ('title', 'description')