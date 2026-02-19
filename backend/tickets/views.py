import os
import json
import logging
import google.generativeai as genai
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Min, Max
from .models import Ticket
from .serializers import TicketSerializer

# Configure Logger
logger = logging.getLogger(__name__)

# Configure Gemini
try:
    genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
except Exception as e:
    logger.error(f"Failed to configure Gemini API: {e}")

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer

    def get_queryset(self):
        """
        Supports filtering by category, priority, status, and search.
        """
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Returns aggregated statistics using DB-level aggregation.
        """
        total_tickets = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status='open').count()

        # Avg Tickets Per Day
        date_stats = Ticket.objects.aggregate(
            first_date=Min('created_at'),
            last_date=Max('created_at')
        )
        
        avg_per_day = 0
        if date_stats['first_date'] and date_stats['last_date']:
            delta = (date_stats['last_date'].date() - date_stats['first_date'].date()).days + 1
            if delta > 0:
                avg_per_day = round(total_tickets / delta, 1)

        priority_data = {item['priority']: item['count'] for item in Ticket.objects.values('priority').annotate(count=Count('id'))}
        category_data = {item['category']: item['count'] for item in Ticket.objects.values('category').annotate(count=Count('id'))}

        for p in ['low', 'medium', 'high', 'critical']:
            priority_data.setdefault(p, 0)

        return Response({
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "avg_tickets_per_day": avg_per_day,
            "priority_breakdown": priority_data,
            "category_breakdown": category_data,
        })

    @action(detail=False, methods=['post'])
    def classify(self, request):
        """
        Uses Gemini to suggest category and priority.
        """
        description = request.data.get('description', '')
        if not description:
            return Response({"error": "Description is required"}, status=400)

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""
            Analyze the support ticket description: "{description}"
            Categories: billing, technical, account, general
            Priorities: low, medium, high, critical
            Return ONLY JSON: {{"suggested_category": "...", "suggested_priority": "..."}}
            """
            response = model.generate_content(prompt)
            clean_text = response.text.strip().replace('```json', '').replace('```', '')
            
            start, end = clean_text.find('{'), clean_text.rfind('}')
            if start != -1 and end != -1:
                clean_text = clean_text[start:end+1]

            return Response(json.loads(clean_text))
        except Exception as e:
            logger.error(f"LLM Classify Error: {e}")
            return Response({"suggested_category": "general", "suggested_priority": "medium"})

    @action(detail=False, methods=['post'])
    def suggest_solution(self, request):
        """
        Asks Gemini for a concise technical solution, with a humorous fallback for off-topic inputs.
        """
        description = request.data.get('description', '')
        if not description:
            return Response({"error": "Description is required"}, status=400)

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""
            You are a Technical Support AI. Read the following user issue:
            "{description}"

            Instructions:
            1. If the issue is a personal problem, a joke, a philosophical question, or completely unrelated to IT/software support: Reply in a very humorous, witty, and slightly sarcastic way. Acknowledge their funny issue, but gently remind them that you are strictly an IT Support AI and can only fix servers, bugs, and software.
            2. If it IS a valid technical/software/business issue: Provide a strictly professional, concise, 2-sentence technical solution. Do not use humor here.
            """
            response = model.generate_content(prompt)
            return Response({"solution": response.text.strip()})
        except Exception as e:
            logger.error(f"LLM Solution Error: {e}")
            return Response({"solution": "Unable to connect to the AI mainframe at this time."}, status=500)