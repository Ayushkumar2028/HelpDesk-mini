from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('agent', 'Agent'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    groups = models.ManyToManyField(
        Group,
        related_name='tickets_users',   
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='tickets_users_permissions',   
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class Ticket(models.Model):
    STATUS_CHOICES = (('open', 'Open'), ('closed', 'Closed'))
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, related_name='tickets', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, related_name='assigned_tickets', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sla_hours = models.IntegerField(default=24)   
    version = models.IntegerField(default=1)   
    @property
    def sla_due(self):
        return self.created_at + timezone.timedelta(hours=self.sla_hours)

    @property
    def sla_breached(self):
        return timezone.now() > self.sla_due

class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name='comments', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)