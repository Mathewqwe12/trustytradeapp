# TrustyTrade Frontend

Фронтенд часть приложения TrustyTrade - Telegram Mini App для безопасной торговли игровыми аккаунтами.

## Технологии

- TypeScript
- Vite
- Telegram Web App SDK

## Установка

1. Установите зависимости:

```bash
npm install
```

2. Запустите сервер разработки:

```bash
npm run dev
```

3. Откройте [http://localhost:5174](http://localhost:5174) в браузере.

## Сборка

Для сборки проекта выполните:

```bash
npm run build
```

Собранные файлы будут находиться в директории `dist`.

## Структура проекта

```
src/
  ├── api/        # API клиент
  ├── components/ # Компоненты
  ├── pages/      # Страницы
  ├── services/   # Сервисы
  ├── styles/     # Стили
  ├── types/      # TypeScript типы
  └── main.ts     # Точка входа
```

## Разработка

- `npm run dev` - запуск сервера разработки
- `npm run build` - сборка проекта
- `npm run preview` - предпросмотр собранного проекта 