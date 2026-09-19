# 🎯 OmniNotice — Sigma Notification Widget
Frontend для системы корпоративных уведомлений OmniNotice.

React + TypeScript + Vite + Chakra UI. Atomic Design. 110 тестов (Vitest).

📖 О проекте
OmniNotice — система отправки уведомлений через каналы:

Email — через Synora
In-App (лента + всплывающая плашка) — через Vishenka-services
# Мой вклад:<br>
✅ Настроил тестовое окружение с нуля (Vitest + Testing Library)<br>
✅ Написал 110 тестов (Unit + Integration + Snapshot)<br>
✅ Интегрировал 2 API (Synora, Vishenka-services)<br>
✅ Настроил ESLint + правила<br>
✅ Покрытие ключевых модулей: 82-100%<br>
# 🛠 Стек технологий<br>
Слой	Технологии<br>
Frontend	React 18, TypeScript, Vite<br>
UI	Chakra UI, Framer Motion<br>
Routing	react-router-dom v6<br>
State	React Context + custom formStore<br>
Тесты	Vitest, Testing Library, jsdom<br>
Линтер	ESLint, Biome<br>
CI/CD	GitLab CI, GitHub Actions<br>
# 🚀 Запуск<br>
1. Клонировать<br>
git clone https://github.com/vagap85/omninotice-frontend.git cd omninotice-frontend<br>

2. Установить зависимости<br>
npm install<br>

3. Скопировать env<br>
cp .env.example .env<br>

4. Запустить<br>
npm run dev Откройте: http://localhost:5173<br>

# 🧪 Тесты<br>
Watch-режим<br>
npm run test<br>

Один прогон<br>
npm run test:run<br>

С покрытием<br>
npm run test:coverage<br>

UI-режим<br>
npm run test:ui<br>
Результат: ✅ 110 тестов в 16 файлах<br>

Покрытие<br>
Слой Тестов<br>
Unit (атомы, validators, formStore) 62<br>
Integration (API, страницы) 41<br>
Snapshot (атомы) 5<br>
Routing (ProtectedRoute) 2<br>

# 📐 Архитектура (Atomic Design)<br>
src/<br>
├── api/ # API-клиенты (userCenter, synora, vishenka)<br>
├── auth/ # AuthContext<br>
├── components/<br>
│ ├── atoms/ # Button, Input, Icons<br>
│ ├── molecules/ # Form, PageHeader<br>
│ └── organisms/ # Header, Forms, Sections<br>
├── pages/ # Auth, HomePage, Notifications<br>
├── routing/ # ProtectedRoute<br>
├── test/ # setup, utils, mocks<br>
├── tests/ # все тесты<br>
└── utils/ # утилиты<br>

# 🔌API-интеграции<br>
Synora (Email)<br>

POST {VITE_SYNORA_BASE_URL}/event/send/{topic}
{ send_to: "user@mail.com",
data: { subject, body, ... }
}
Vishenka-services (In-App)<br>

Vishenka-services (In-App) POST {VITE_VISHENKA_BASE_URL}/api/v1/dispatches { request_id: UUID, application_id: "sigma", channel: "feed" | "popup", title, body, audience_type: "all" | "selected", recipient_ids: UUID[] }

# 📦 Переменные окружения<br>
VITE_SYNORA_BASE_URL=https://api.synora.example.ru<br>
VITE_SYNORA_PROJECT_ID=example<br>
VITE_USERCENTER_BASE_URL=https://api.users.example.ru<br>
VITE_USERCENTER_PROJECT_ID=example<br>
VITE_VISHENKA_BASE_URL=https://vishenka.example.ru<br>
📝 Лицензия MIT<br>

👤 Автор Evgeny Agapov<br>

GitHub: @vagap85
