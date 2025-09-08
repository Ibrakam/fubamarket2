from django.db import transaction
from django.contrib.auth.models import User
from .models import Order, OrderItem, Product, Referral

GLOBAL_COMMISSION_PCT = 10
ALLOW_SELF_REF = False

@transaction.atomic
def settle_referral(order: Order):
    vendor_id = order.ref_vendor_id
    if not vendor_id:
        return
    vendor = User.objects.filter(id=vendor_id).first()
    if not vendor:
        return
    if not ALLOW_SELF_REF and order.customer_email and vendor.email and order.customer_email.strip().lower() == vendor.email.strip().lower():
        Referral.objects.update_or_create(order=order, vendor=vendor, defaults={
            'self_blocked': True,
            'status': 'rejected',
            'amount_uzs': 0,
        })
        return
    items = order.items.select_related('product').all()
    commission = 0
    for it in items:
        p = it.product
        if p.vendor_id != vendor_id:
            continue
        pct = GLOBAL_COMMISSION_PCT
        commission += round(it.line_total_uzs * pct / 100)
    if commission > 0:
        Referral.objects.update_or_create(order=order, vendor_id=vendor_id, defaults={
            'amount_uzs': commission,
            'status': 'approved',
            'self_blocked': False,
        })
