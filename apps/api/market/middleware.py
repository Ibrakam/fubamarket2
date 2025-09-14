"""
Middleware для автоматического отслеживания реферальных посещений
"""
import requests
import json
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from .referral_utils import track_referral_from_url, get_or_create_anonymous_id, set_anonymous_id_cookie

class ReferralTrackingMiddleware(MiddlewareMixin):
    """
    Middleware для отслеживания реферальных посещений
    """
    
    def process_request(self, request):
        """Обрабатывает входящий запрос"""
        # Проверяем, есть ли реферальные параметры в URL
        tracking_data = track_referral_from_url(request)
        
        if tracking_data:
            # Сохраняем данные для обработки в process_response
            request._referral_tracking_data = tracking_data
    
    def process_response(self, request, response):
        """Обрабатывает исходящий ответ"""
        # Устанавливаем anonymous_id cookie если его нет
        anonymous_id = get_or_create_anonymous_id(request)
        if not request.COOKIES.get('anonymous_id'):
            response = set_anonymous_id_cookie(response, anonymous_id)
        
        # Отправляем данные о реферальном посещении на API
        if hasattr(request, '_referral_tracking_data'):
            self._track_referral_visit(request._referral_tracking_data, request)
        
        return response
    
    def _track_referral_visit(self, tracking_data, request):
        """Отправляет данные о реферальном посещении на API"""
        try:
            # URL API для отслеживания посещений
            api_url = f"{settings.API_BASE_URL}/market/track-visit/"
            
            # Добавляем IP адрес и User-Agent
            tracking_data.update({
                'ip_address': self._get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            })
            
            # Отправляем POST запрос на API
            response = requests.post(
                api_url,
                json=tracking_data,
                timeout=5,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                print(f"Successfully tracked referral visit: {tracking_data['referral_code']}")
            else:
                print(f"Failed to track referral visit: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"Error tracking referral visit: {e}")
    
    def _get_client_ip(self, request):
        """Получает IP адрес клиента"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip