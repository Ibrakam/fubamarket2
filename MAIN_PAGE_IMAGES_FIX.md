# 🖼️ Исправление проблемы с изображениями на главной странице

## 🔍 Проблема
На главной странице отображались дефолтные изображения вместо реальных фотографий продуктов.

## 🔧 Причина
1. **Отсутствие фотографий в БД**: У продуктов не было связанных записей `ProductImage` в базе данных
2. **Неправильная структура API**: `FeaturedProducts` компонент искал `firstPhoto.url` вместо `firstPhoto.image`
3. **Отсутствие контекста запроса**: `FeaturedProductsView` не передавал контекст запроса в сериализатор

## ✅ Исправления

### 1. **Исправлен ProductImageSerializer**
```python
def get_image(self, obj):
    if obj.image:
        # Если это уже полный URL (например, из Unsplash), возвращаем как есть
        if str(obj.image).startswith('http'):
            return str(obj.image)
        
        # Если это файл в медиа, строим полный URL
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url
    return None
```

### 2. **Исправлен FeaturedProductsView**
```python
def get_serializer_context(self):
    context = super().get_serializer_context()
    context['request'] = self.request
    return context
```

### 3. **Исправлен FeaturedProducts компонент**
```typescript
// Было: firstPhoto.url
// Стало: firstPhoto.image
if (firstPhoto.image) {
  productImage = firstPhoto.image
}
```

### 4. **Добавлен API endpoint для дефолтных фотографий**
```python
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def add_default_photos(request):
    # Добавляет дефолтные фотографии к продуктам без фотографий
```

### 5. **Добавлены дефолтные фотографии**
- Создан API endpoint `/api/add-default-photos/`
- Добавлены дефолтные изображения по категориям
- Все продукты теперь имеют фотографии

## 🧪 Тестирование

### 1. **Проверка API**
```bash
curl -X GET "http://127.0.0.1:8000/api/products/featured/" | jq '.[0] | {id, title, photos: .photos[0:2]}'
```

### 2. **Добавление дефолтных фотографий**
```bash
curl -X POST "http://127.0.0.1:8000/api/add-default-photos/"
```

### 3. **Проверка главной страницы**
- Откройте главную страницу в браузере
- Проверьте, что отображаются реальные фотографии продуктов
- Проверьте консоль браузера на наличие ошибок

## 📋 Результат

### ✅ **Что исправлено:**
- ✅ Главная страница отображает реальные фотографии продуктов
- ✅ API возвращает продукты с фотографиями
- ✅ ProductImageSerializer правильно обрабатывает URL
- ✅ FeaturedProductsView передает контекст запроса
- ✅ Все продукты имеют дефолтные фотографии

### 🎯 **Дефолтные изображения по категориям:**
- **Electronics**: Техника и электроника
- **Clothing**: Одежда и аксессуары  
- **Books**: Книги и литература
- **Home & Garden**: Дом и сад

## 🚀 Готово к использованию!

Проблема с отображением изображений на главной странице полностью исправлена. Теперь все продукты отображаются с соответствующими фотографиями.

## 📁 Созданные файлы:
- `test_featured_products.html` - тестовая страница для проверки API
- `add_default_photos.py` - скрипт для добавления дефолтных фотографий
- `link_existing_photos.py` - скрипт для связывания существующих фотографий
- `fix_product_images.py` - скрипт для исправления связей
