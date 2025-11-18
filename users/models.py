# users/models.py
import string
import random
from django.db import models
from django.utils import timezone

def generate_user_id():
    prefix = 'USRID'
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return prefix + suffix

class UserDetail(models.Model):
    userId = models.CharField(max_length=20, unique=True, default=generate_user_id, editable=False, db_index=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    age = models.IntegerField()
    phone = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return f"{self.name} ({self.userId})"
    
class UserVerification(models.Model):
    STATUS_CHOICES = (
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )

    user = models.OneToOneField(UserDetail, on_delete=models.CASCADE, related_name='verification')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    verifier = models.CharField(max_length=100)
    reason = models.TextField(blank=True, null=True)  # optional, used for rejection
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.userId} - {self.status} by {self.verifier}"
