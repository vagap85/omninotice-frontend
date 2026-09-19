🎯 OmniNotice — Sigma Notification Widget
Frontend для системы корпоративных уведомлений OmniNotice.

React + TypeScript + Vite + Chakra UI. Atomic Design. 110 тестов (Vitest).

Tests

📖 О проекте
OmniNotice — система отправки уведомлений через каналы:

Email — через Synora
In-App (лента + всплывающая плашка) — через Vishenka-services
Мой вклад:

✅ Настроил тестовое окружение с нуля (Vitest + Testing Library)
✅ Написал 110 тестов (Unit + Integration + Snapshot)
✅ Интегрировал 2 API (Synora, Vishenka-services)
✅ Настроил ESLint + правила
✅ Покрытие ключевых модулей: 82-100%
🛠 Стек технологий
Слой	Технологии
Frontend	React 18, TypeScript, Vite
UI	Chakra UI, Framer Motion
Routing	react-router-dom v6
State	React Context + custom formStore
Тесты	Vitest, Testing Library, jsdom
Линтер	ESLint, Biome
CI/CD	GitLab CI, GitHub Actions
🚀 Запуск
1. Клонировать
git clone https://github.com/vagap85/omninotice-frontend.git cd omninotice-frontend

2. Установить зависимости
npm install

3. Скопировать env
cp .env.example .env

4. Запустить
npm run dev Откройте: http://localhost:5173

🧪 Тесты
Watch-режим
npm run test

Один прогон
npm run test:run

С покрытием
npm run test:coverage

UI-режим
npm run test:ui
Результат: ✅ 110 тестов в 16 файлах

Покрытие
Слой Тестов
Unit (атомы, validators, formStore) 62
Integration (API, страницы) 41
Snapshot (атомы) 5
Routing (ProtectedRoute) 2

📐 Архитектура (Atomic Design)
src/
├── api/ # API-клиенты (userCenter, synora, vishenka)
├── auth/ # AuthContext
├── components/
│ ├── atoms/ # Button, Input, Icons
│ ├── molecules/ # Form, PageHeader
│ └── organisms/ # Header, Forms, Sections
├── pages/ # Auth, HomePage, Notifications
├── routing/ # ProtectedRoute
├── test/ # setup, utils, mocks
├── tests/ # все тесты
└── utils/ # утилиты

🔌API-интеграции
Synora (Email)

POST {VITE_SYNORA_BASE_URL}/event/send/{topic}
{ send_to: "user@mail.com",
data: { subject, body, ... }
}
Vishenka-services (In-App)

Vishenka-services (In-App) POST {VITE_VISHENKA_BASE_URL}/api/v1/dispatches { request_id: UUID, application_id: "sigma", channel: "feed" | "popup", title, body, audience_type: "all" | "selected", recipient_ids: UUID[] }

📦 Переменные окружения
VITE_SYNORA_BASE_URL=https://api.synora.example.ru
VITE_SYNORA_PROJECT_ID=example
VITE_USERCENTER_BASE_URL=https://api.users.example.ru
VITE_USERCENTER_PROJECT_ID=example
VITE_VISHENKA_BASE_URL=https://vishenka.example.ru
📝 Лицензия MIT

👤 Автор Evgeny Agapov

GitHub: @vagap85