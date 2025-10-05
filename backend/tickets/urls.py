from django.urls import path
from .views import TicketCreateView, TicketListView, TicketDetailView, CommentCreateView,create_admin

urlpatterns = [
    path('tickets/', TicketListView.as_view()),
    path('tickets/new/', TicketCreateView.as_view()),
    path('tickets/<int:pk>/', TicketDetailView.as_view()),
    path('tickets/<int:ticket_id>/comments/', CommentCreateView.as_view()),

    path('create-admin/', create_admin),    
]
