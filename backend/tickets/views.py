from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Q

from django.contrib.auth import get_user_model
User = get_user_model()

# Create Ticket
class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

# List Tickets
class TicketListView(generics.ListAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(comments__content__icontains=search)
            ).distinct()
        return queryset

# Retrieve / Update Ticket
class TicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.all()

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        client_version = int(request.data.get('version', 0))
        if client_version != instance.version:
            return Response({"error": {"code": "STALE_UPDATE", "message": "Version mismatch"}}, status=409)
        instance.version += 1
        return super().patch(request, *args, **kwargs)

# Add Comment
class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        ticket_id = self.kwargs['pk']
        ticket = Ticket.objects.get(pk=ticket_id)
        serializer.save(author=self.request.user, ticket=ticket)


def create_admin(request):
    try:
        # Use get_user_model() already defined as User in your file
        if not User.objects.filter(username='root').exists():
            User.objects.create_superuser('root', 'root@example.com', '1234')
            return JsonResponse({'status': 'created'})
        else:
            return JsonResponse({'status': 'already exists'})
    except Exception as e:
        # Return error string so we can see in logs / postman
        return JsonResponse({'error': str(e)}, status=500)


from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.views import APIView
# ✅ Custom token view compatible with custom User model
class CustomAuthToken(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=400)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

def perform_create(self, serializer):
    # support both 'ticket_id' (your urls.py) and 'pk' (common pattern)
    ticket_id = self.kwargs.get('ticket_id') or self.kwargs.get('pk')
    ticket = get_object_or_404(Ticket, pk=ticket_id)
    serializer.save(author=self.request.user, ticket=ticket)

from django.apps import AppConfig

class TicketsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tickets'

    def ready(self):
        # auto-create a superuser if not present. Wrapped in try/except to avoid breaking migrations
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(username='root').exists():
                User.objects.create_superuser('root', 'root@example.com', '1234')
        except Exception:
            # Swallow exceptions so migrations/startup don't fail; check logs for details.
            pass