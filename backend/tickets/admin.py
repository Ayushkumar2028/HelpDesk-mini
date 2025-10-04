from django.contrib import admin

# Register your models here.
from .models import User, Ticket, Comment

admin.site.register(User)
admin.site.register(Ticket)
admin.site.register(Comment)