from datetime import timedelta
from django.utils.deprecation import MiddlewareMixin

class RefUtmCookieMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        ref = request.GET.get('ref')
        if ref and ref.isdigit():
            response.set_cookie('ref', ref, max_age=60*60*24*30)
        for k, v in request.GET.items():
            if k.lower().startswith('utm_'):
                response.set_cookie(k, v, max_age=60*60*24*30)
        return response
