<<<<<<< README.md
# OmniNotice

Платформа рассылок на все каналы. Первый сценарий: страница создания уведомления и отправка через Synora.

## Стек

- React 18 + TypeScript
- Vite
- Chakra UI

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости измените:

- `VITE_SYNORA_BASE_URL` — базовый URL API Synora (например, `https://api.synora.skroy.ru`)
- `VITE_SYNORA_EVENT_TOPIC` — топик события для отправки (должен быть настроен в реестре Synora)

## Отправка через Synora

При нажатии «Отправить» фронтенд вызывает:

```
POST {VITE_SYNORA_BASE_URL}/event/send/{VITE_SYNORA_EVENT_TOPIC}
Content-Type: application/json

{
  "send_to": "email@example.com",
  "data": {
    "subject": "заголовок",
    "body": "текст",
    "textColor": "#10f48a",
    "fontSize": "16px"
  }
}
```

В Synora должны быть настроены:

1. Конфигурация события с `topic` = `VITE_SYNORA_EVENT_TOPIC` и действиями (например, `prepare_mail` → `mail_send`).
2. Шаблон сообщения (если используется `template_name` в конфигурации).
3. Конфигурация отправителя email (`event.sender.email`).

## Сборка

```bash
npm run build
npm run preview
```

