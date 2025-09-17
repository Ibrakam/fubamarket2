# Реферальная система FubaMarket

## Обзор

Реферальная система позволяет пользователям зарабатывать деньги, приглашая друзей и знакомых на платформу. Система автоматически отслеживает переходы по реферальным ссылкам и начисляет вознаграждения за покупки.

## Архитектура

### Backend (Django)

#### Модели

1. **ReferralProgram** - Настройки реферальной программы
   - `min_payout_amount` - Минимальная сумма для выплаты
   - `attribution_window_days` - Окно атрибуции в днях
   - `reward_percentage` - Процент вознаграждения
   - `max_reward_amount` - Максимальная сумма вознаграждения

2. **ReferralLink** - Реферальные ссылки
   - `user` - Создатель ссылки
   - `product` - Привязанный товар (опционально)
   - `code` - Уникальный код ссылки
   - `is_active` - Активна ли ссылка
   - `expires_at` - Дата истечения

3. **ReferralVisit** - Записи о посещениях
   - `referral_link` - Ссылка, по которой перешли
   - `anonymous_id` - ID анонимного пользователя
   - `user` - Зарегистрированный пользователь (если есть)
   - `ip_address` - IP адрес
   - `utm_source` - UTM метки

4. **ReferralAttribution** - Атрибуция покупок
   - `anonymous_id` - ID анонимного пользователя
   - `user` - Зарегистрированный пользователь
   - `referral_link` - Реферальная ссылка
   - `product` - Товар
   - `expires_at` - Когда истекает атрибуция

5. **ReferralReward** - Вознаграждения
   - `referral_link` - Реферальная ссылка
   - `order` - Заказ
   - `attributed_user` - Кому начислено вознаграждение
   - `reward_amount` - Сумма вознаграждения
   - `status` - Статус (PENDING, APPROVED, REVERSED, PAID_OUT)

6. **ReferralPayout** - Запросы на выплату
   - `user` - Пользователь
   - `amount` - Сумма выплаты
   - `payment_method` - Способ выплаты
   - `status` - Статус (PENDING, PROCESSING, COMPLETED, REJECTED)

7. **ReferralBalance** - Баланс пользователя
   - `total_earned` - Всего заработано
   - `locked_amount` - Заблокировано
   - `available_amount` - Доступно для вывода
   - `total_paid_out` - Выплачено

#### API Endpoints

- `GET /api/market/referral-programs/` - Список программ
- `POST /api/market/referral-links/` - Создать ссылку
- `GET /api/market/referral-links/` - Мои ссылки
- `POST /api/market/track-visit/` - Отследить посещение
- `GET /api/market/referral-rewards/` - Мои вознаграждения
- `POST /api/market/process-purchase/` - Обработать покупку
- `POST /api/market/referral-payouts/` - Запрос выплаты
- `GET /api/market/referral-balance/` - Мой баланс
- `GET /api/market/referral-stats/` - Статистика

### Frontend (Next.js)

#### Компоненты

1. **ReferralLinkCreator** - Создание реферальных ссылок
2. **ReferralStats** - Статистика и баланс
3. **ReferralRewards** - Список вознаграждений
4. **ReferralPayoutRequest** - Запрос выплаты

#### Страницы

- `/referral` - Главная страница реферальной программы

## Логика работы

### 1. Создание реферальной ссылки

```typescript
// Пользователь создает ссылку
POST /api/market/referral-links/
{
  "product": 123,  // ID товара (опционально)
  "expires_at": "2024-12-31T23:59:59Z"  // Дата истечения (опционально)
}

// Ответ
{
  "id": 1,
  "code": "ABC12345",
  "referral_url": "https://site.com/product/slug?ref=ABC12345&utm_source=referral"
}
```

### 2. Отслеживание посещения

```typescript
// При переходе по ссылке
POST /api/market/track-visit/
{
  "referral_code": "ABC12345",
  "anonymous_id": "uuid-here",
  "utm_source": "referral",
  "utm_medium": "social",
  "utm_campaign": "summer"
}
```

### 3. Атрибуция покупки

```typescript
// При создании заказа
POST /api/market/process-purchase/
{
  "order_id": 456,
  "anonymous_id": "uuid-here"
}

// Система автоматически:
// 1. Находит активные атрибуции
// 2. Создает вознаграждения
// 3. Блокирует суммы на балансе
```

### 4. Подтверждение заказа

```typescript
// При подтверждении заказа
// Система автоматически:
// 1. Меняет статус вознаграждений на APPROVED
// 2. Переносит суммы из locked в available
```

## Анти-фрод система

### Проверки

1. **IP адрес** - Сравнение с IP посещения
2. **User-Agent** - Сравнение браузера
3. **Время** - Слишком быстрое оформление заказа
4. **Частота** - Много покупок с одной атрибуции

### Оценка риска

```python
def calculate_fraud_score(attribution, order, request):
    score = 0.0
    
    # Проверяем IP адрес
    if attribution.last_visit.ip_address != request.META.get('REMOTE_ADDR'):
        score += 0.3
    
    # Проверяем время между посещением и покупкой
    time_diff = timezone.now() - attribution.last_visit.visited_at
    if time_diff.total_seconds() < 60:  # Менее минуты
        score += 0.4
    
    # Проверяем количество покупок
    recent_rewards = ReferralReward.objects.filter(
        referral_link=attribution.referral_link,
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    if recent_rewards > 5:
        score += 0.3
    
    return min(score, 1.0)
```

## Настройка

### 1. Создание реферальной программы

```python
# В Django admin или через API
ReferralProgram.objects.create(
    name="Default Program",
    is_active=True,
    min_payout_amount=50.00,
    attribution_window_days=30,
    reward_percentage=5.00,
    max_reward_amount=1000.00
)
```

### 2. Middleware для отслеживания

```python
# Добавить в MIDDLEWARE
'market.middleware.ReferralTrackingMiddleware'
```

### 3. Сигналы для автоматической обработки

```python
# Автоматически обрабатывают:
# - Создание вознаграждений при заказе
# - Подтверждение при подтверждении заказа
# - Отмена при отмене заказа
# - Обновление баланса
```

## Использование

### 1. Создание ссылки

```tsx
import ReferralLinkCreator from '@/components/referral-link-creator'

// Для конкретного товара
<ReferralLinkCreator 
  productId={123} 
  productName="Название товара" 
/>

// Общая ссылка
<ReferralLinkCreator />
```

### 2. Отображение статистики

```tsx
import ReferralStats from '@/components/referral-stats'

<ReferralStats />
```

### 3. Список вознаграждений

```tsx
import ReferralRewards from '@/components/referral-rewards'

<ReferralRewards />
```

### 4. Запрос выплаты

```tsx
import ReferralPayoutRequest from '@/components/referral-payout-request'

<ReferralPayoutRequest />
```

## Безопасность

### 1. Валидация данных

- Проверка прав доступа к API
- Валидация сумм выплат
- Проверка минимальных сумм

### 2. Анти-фрод

- Отслеживание подозрительной активности
- Блокировка мошеннических вознаграждений
- Логирование всех операций

### 3. Конфиденциальность

- Анонимные ID для отслеживания
- Шифрование персональных данных
- Соблюдение GDPR

## Мониторинг

### 1. Логи

- Все операции логируются
- Отслеживание ошибок
- Мониторинг производительности

### 2. Метрики

- Количество ссылок
- Конверсионная ставка
- Сумма вознаграждений
- Количество выплат

### 3. Алерты

- Подозрительная активность
- Ошибки в обработке
- Превышение лимитов

## Развертывание

### 1. Миграции

```bash
python manage.py makemigrations market
python manage.py migrate
```

### 2. Создание суперпользователя

```bash
python manage.py createsuperuser
```

### 3. Настройка реферальной программы

```python
# В Django shell
from market.models import ReferralProgram

ReferralProgram.objects.create(
    name="Default Program",
    is_active=True,
    min_payout_amount=50.00,
    attribution_window_days=30,
    reward_percentage=5.00
)
```

### 4. Запуск сервера

```bash
python manage.py runserver
```

## Тестирование

### 1. Unit тесты

```python
# Тесты для моделей
python manage.py test market.tests.test_models

# Тесты для API
python manage.py test market.tests.test_api
```

### 2. Интеграционные тесты

```python
# Тесты полного цикла
python manage.py test market.tests.test_integration
```

### 3. Нагрузочные тесты

```python
# Тесты производительности
python manage.py test market.tests.test_performance
```

## Поддержка

### 1. Документация API

- Swagger UI доступен по адресу `/api/docs/`
- OpenAPI спецификация в `/api/schema/`

### 2. Логи

- Django логи в `logs/django.log`
- Nginx логи в `/var/log/nginx/`
- Системные логи в `/var/log/syslog`

### 3. Мониторинг

- Статус системы: `/health/`
- Метрики: `/metrics/`
- Алерты: настройка в административной панели

