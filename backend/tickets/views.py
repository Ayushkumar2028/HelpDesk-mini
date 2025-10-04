from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Q

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

