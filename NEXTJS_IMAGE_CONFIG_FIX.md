# 🖼️ Исправление конфигурации Next.js для изображений

## ❌ **Проблема:**
```
Invalid src prop (http://127.0.0.1:8000/media/products/2025/10/05/photo_2025-09-29_22.46.39.jpeg) on `next/image`, hostname "127.0.0.1" is not configured under images in your `next.config.js`
```

## ✅ **Решение:**

### 1. **Обновлен `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

### 2. **Что добавлено:**
- ✅ Конфигурация `images.remotePatterns` для Django медиа файлов
- ✅ Поддержка `http://127.0.0.1:8000/media/**` для локальных изображений
- ✅ Поддержка `https://images.unsplash.com/**` для дефолтных изображений
- ✅ Исправлен двойной слеш в rewrite правиле

### 3. **Результат:**
- ✅ Next.js Image компонент теперь может загружать изображения с Django сервера
- ✅ Дефолтные изображения с Unsplash работают корректно
- ✅ Ошибка "hostname not configured" исправлена

## 🔄 **Перезапуск необходим:**
После изменения `next.config.js` необходимо перезапустить Next.js сервер:

```bash
# Остановить сервер (Ctrl+C)
# Затем запустить снова:
npm run dev
# или
yarn dev
```

## 🧪 **Тестирование:**
1. Откройте админ панель: `http://localhost:3000/admin/products`
2. Попробуйте редактировать продукт
3. Проверьте, что изображения отображаются корректно
4. Убедитесь, что нет ошибок в консоли

## 📝 **Примечания:**
- Для продакшена замените `127.0.0.1:8000` на ваш домен
- Добавьте другие домены изображений по необходимости
- Конфигурация поддерживает как HTTP, так и HTTPS протоколы
