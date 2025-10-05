# 🖼️ Исправление ошибок с пустыми src в Next.js Image

## ❌ **Проблемы:**
```
An empty string ("") was passed to the src attribute. This may cause the browser to download the whole page again over the network.
Image is missing required "src" property: {}
```

## 🔍 **Причина:**
- У некоторых фотографий `photo.image` может быть `null`, `undefined` или пустой строкой
- `URL.createObjectURL(photo)` может вернуть пустую строку для некорректных файлов
- Next.js Image компонент не может обработать пустые src

## ✅ **Решение:**

### 1. **Для существующих фотографий:**
```tsx
{photo.image ? (
  <Image
    src={photo.image}
    alt={photo.alt || 'Product photo'}
    width={96}
    height={96}
    className="w-full h-24 object-cover rounded-lg border"
  />
) : (
  <div className="w-full h-24 bg-gray-200 rounded-lg border flex items-center justify-center">
    <span className="text-gray-500 text-xs">No image</span>
  </div>
)}
```

### 2. **Для новых фотографий (preview):**
```tsx
{photos.map((photo, index) => {
  const imageUrl = URL.createObjectURL(photo)
  return (
    <div key={index} className="relative">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`Preview ${index + 1}`}
          width={96}
          height={96}
          className="w-full h-24 object-cover rounded-lg border"
        />
      ) : (
        <div className="w-full h-24 bg-gray-200 rounded-lg border flex items-center justify-center">
          <span className="text-gray-500 text-xs">Invalid file</span>
        </div>
      )}
      {/* ... кнопка удаления ... */}
    </div>
  )
})}
```

## 🎯 **Что исправлено:**

### ✅ **Проверка существования изображения:**
- Добавлена проверка `photo.image` перед рендерингом Image
- Добавлена проверка `imageUrl` для preview изображений

### ✅ **Fallback UI:**
- Показывается placeholder с текстом "No image" для отсутствующих изображений
- Показывается placeholder с текстом "Invalid file" для некорректных файлов

### ✅ **Безопасность:**
- Предотвращены ошибки с пустыми src
- Улучшена обработка ошибок загрузки файлов

## 🧪 **Результат:**
- ✅ Нет ошибок в консоли браузера
- ✅ Корректное отображение существующих фотографий
- ✅ Корректный preview новых фотографий
- ✅ Graceful fallback для проблемных изображений

## 📝 **Дополнительные улучшения:**
- Добавлен fallback для `alt` атрибута
- Улучшена типизация с проверкой существования данных
- Добавлена визуальная индикация отсутствующих изображений
