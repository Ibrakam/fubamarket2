# Анализ системы цен в FubaMarket

## 🏗️ Архитектура системы цен

### 1. **Backend (Django) - Хранение цен**

#### Модель Product:
```python
price_uzs = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
```

**Ключевые особенности:**
- Цены хранятся в **сумах (UZS)** в базе данных
- Используется `DecimalField` для точности (10 цифр, 2 знака после запятой)
- Минимальное значение: 0

#### Модель OrderItem:
```python
price = models.DecimalField(max_digits=10, decimal_places=2)
```

**Особенности:**
- Цена заказа сохраняется в сумах на момент покупки
- Защищает от изменения цен после оформления заказа

### 2. **Frontend (Next.js) - Отображение цен**

#### Система конвертации:
```typescript
// lib/currency.ts
const USD_TO_UZS_RATE = 12500

export function convertUsdToUzs(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_UZS_RATE)
}
```

#### Форматирование цен:
```typescript
export function formatUzsWithSpaces(amount: number): string {
  return amount.toLocaleString('uz-UZ') + ' so\'m'
}
```

## 🔄 Логика работы с ценами

### 1. **Админ панель - Ввод цен**
- Администратор вводит цены **напрямую в сумах**
- Поле: `price_uzs` (например: 125000 сум)
- Сохраняется в базе данных как есть

### 2. **Frontend - Отображение цен**
- API возвращает цены в сумах (`price_uzs`)
- Frontend конвертирует их в "доллары" для внутренних вычислений
- При отображении конвертирует обратно в сумы

### 3. **Конвертация в use-product-filters.ts:**
```typescript
price: (Number(p.price_uzs) || 0) / 100, // Convert from cents to dollars
```

**⚠️ ПРОБЛЕМА:** Здесь есть ошибка в логике!

## 🚨 Обнаруженные проблемы

### 1. **Неправильная конвертация в use-product-filters.ts**
```typescript
// НЕПРАВИЛЬНО:
price: (Number(p.price_uzs) || 0) / 100, // Делит на 100

// ПРАВИЛЬНО должно быть:
price: Number(p.price_uzs) || 0, // Без деления на 100
```

### 2. **Двойная конвертация в product-card.tsx**
```typescript
// Получаем цену в "долларах" (но она уже в сумах!)
const priceInUzs = useMemo(() => convertUsdToUzs(product.price), [product.price])
```

**Результат:** Цена умножается на 12500 дважды!

### 3. **Несоответствие в отображении**
- В админ панели: `125000 сум` (правильно)
- На главной странице: `1,562,500,000 сум` (неправильно!)

## 🔧 Исправления

### 1. **Исправить use-product-filters.ts:**
```typescript
// БЫЛО:
price: (Number(p.price_uzs) || 0) / 100,

// ДОЛЖНО БЫТЬ:
price: Number(p.price_uzs) || 0,
```

### 2. **Исправить product-card.tsx:**
```typescript
// БЫЛО:
const priceInUzs = useMemo(() => convertUsdToUzs(product.price), [product.price])

// ДОЛЖНО БЫТЬ:
const priceInUzs = useMemo(() => product.price, [product.price])
```

### 3. **Исправить product/[id]/page.tsx:**
```typescript
// БЫЛО:
{formatUzsWithSpaces(convertUsdToUzs(product.price))}

// ДОЛЖНО БЫТЬ:
{formatUzsWithSpaces(product.price)}
```

## 📊 Текущее состояние системы

### ✅ Правильно работает:
- Админ панель (ввод и отображение цен в сумах)
- API (возвращает цены в сумах)
- База данных (хранит цены в сумах)

### ❌ Неправильно работает:
- Главная страница (двойная конвертация)
- Страница продукта (двойная конвертация)
- Карточки продуктов (двойная конвертация)

## 🎯 Рекомендации

### 1. **Упростить систему:**
- Убрать конвертацию USD ↔ UZS
- Работать только с сумами
- Убрать `convertUsdToUzs` функцию

### 2. **Исправить все места отображения:**
- `use-product-filters.ts`
- `product-card.tsx`
- `product/[id]/page.tsx`
- `checkout/page.tsx`
- `orders/page.tsx`

### 3. **Добавить валидацию:**
- Проверить, что цены не отрицательные
- Проверить, что цены не слишком большие
- Добавить лимиты для ввода

## 📝 Заключение

Система цен имеет **фундаментальную проблему** с двойной конвертацией, что приводит к неправильному отображению цен на frontend. Необходимо исправить логику конвертации во всех компонентах, чтобы цены отображались корректно.

**Приоритет:** КРИТИЧЕСКИЙ - пользователи видят неправильные цены!
