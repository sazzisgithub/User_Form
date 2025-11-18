# users/models.py
import string
import random
from django.db import models

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
