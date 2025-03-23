# TrustyTrade

Telegram Mini App для безопасной торговли игровыми аккаунтами.

## Структура проекта

- `docs/` - Документация проекта
- `backend/` - FastAPI бэкенд
- `frontend/` - Vite + TypeScript фронтенд

## Документация

- [Архитектура](docs/architecture.mermaid)
- [Технические детали](docs/technical.md)
- [Бэклог](docs/backlog.md)
- [Статус проекта](docs/status.md)
- [Известные ошибки](docs/errors.md)

## Установка и запуск

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # или .\venv\Scripts\activate на Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Лицензия

MIT 