from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser


# Define the Organization model first, as User will refer to it
class Organization(models.Model):
    """
    Represents an organization within the Document Management System.
    Each user can belong to one organization.
    """
    name = models.CharField(max_length=255, unique=True, help_text="Name of the organization")
    path = models.CharField(max_length=255, unique=True, help_text="Unique path or identifier for the organization (e.g., 'org1', 'company_a')")
    server_address = models.CharField(max_length=255, blank=True, null=True, help_text="Optional: Server address associated with this organization")

    class Meta:
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
        ordering = ['name'] # Order organizations by name by default

    def __str__(self):
        return self.name

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds a department field and links to an Organization.
    """
    department = models.CharField(max_length=100, blank=True)
    
    # Add a ForeignKey to the Organization model
    # on_delete=models.SET_NULL means if an Organization is deleted,
    # users belonging to it will have their organization field set to NULL.
    # blank=True, null=True allows users to not be associated with an organization initially.
   
    organization = models.ForeignKey(Organization,default=1,
                                    on_delete=models.SET_NULL, null=True, blank=True, related_name='users', help_text="The organization this user belongs to")




class Document(models.Model):
    DOC_TYPES = (
        ('payment', 'Payment Request'),
        ('leave', 'Leave Request'),
        ('memo', 'Memo')
    )
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_docs')
    signer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signed_docs', null=True, blank=True)

    title = models.CharField(max_length=200)
    doc_type = models.CharField(max_length=20, choices=DOC_TYPES)
    status = models.CharField(max_length=20, default='pending')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Payment-specific fields
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    recipient = models.CharField(max_length=200, blank=True)
    
    # Leave-specific fields
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    leave_type = models.CharField(max_length=50, blank=True)
    external_number = models.CharField(max_length=100, blank=True)
    guid = models.CharField(max_length=64, unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.get_doc_type_display()}: {self.title}"
    
    
    
   