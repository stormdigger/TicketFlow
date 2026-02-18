from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet

# The router automatically maps:
# GET /api/tickets/stats/ -> stats()
# POST /api/tickets/classify/ -> classify()
# POST /api/tickets/suggest_solution/ -> suggest_solution()
router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
]