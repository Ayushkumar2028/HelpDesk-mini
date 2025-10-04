from rest_framework import serializers
from .models import Ticket, Comment, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    # ticket = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = ['id','title','description','status','created_by','assigned_to','sla_hours','created_at','updated_at','version','comments']
        read_only_fields = ['id','created_by','created_at','updated_at','version','comments']
