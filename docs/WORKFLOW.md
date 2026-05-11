# Workflow репозитория Carsharing

Монорепо: **`frontend/`** (Vite + React), **`backend/`** (Spring Boot), **`docs/`** (контракты и схемы).

## Куда класть код на бэкенде

```
backend/src/main/java/com/carsharing/api/
├── CarsharingApiApplication.java
├── config/          — Security, CORS, Jackson, OpenAPI (позже)
├── domain/          — JPA-сущности (User, Vehicle, …), enums
├── repository/      — Spring Data JPA интерфейсы
├── service/         — бизнес-логика, транзакции @Transactional
├── web/
│   ├── HealthController.java
│   ├── public/      — контроллеры без авторизации: VehicleClass, Tariff, Contact
│   └── auth/        — Register, Login
└── dto/             — request/response record-классы (или подпакеты в web)
```

**Правило:** контроллер тонкий → вызывает **service** → **repository**. Не смешивай SQL в контроллере.

**Миграции:** только в  
`backend/src/main/resources/db/migration/`  
имя файла: `V{номер}__описание.sql`.

## Куда класть код на фронтенде

```
frontend/src/
├── main.tsx                 — точка входа, RouterProvider
├── app/router.tsx           — маршруты
├── styles/tokens.css        — CSS-переменные темы
├── layouts/                 — GuestShell (роутер), PublicPageShell (внутренние страницы)
├── components/
│   ├── public/              — PublicHeader (variant default | hero), PublicFooter
│   └── dev/                 — служебное (статус API)
└── pages/
    ├── home/HomePage.tsx    — главная до регистрации
    ├── fleet/               — автопарк
    ├── tariffs/
    ├── about/
    ├── contact/
    └── auth/                — login / register
```

Новая **внутренняя** гостевая страница: компонент в `pages/…`, обёртка `<PublicPageShell>…</PublicPageShell>` (шапка с градиентной линией внизу через CSS `::after`, общий футер). Главная (`HomePage`) — `<PublicHeader variant="hero" />` без этой линии. Путь — в `app/router.tsx`.

## Документация

| Файл | Содержание |
|------|------------|
| `docs/api/rest-contract.md` | Эндпоинты, JSON вход/выход |
| `docs/database/schema.md` | Таблицы и связи |
| `docs/WORKFLOW.md` | этот файл |

Перед изменением API обновляй **rest-contract.md**, затем контроллер и тесты.

## Рекомендуемый порядок задач

1. Сущности JPA по `V1__initial_schema.sql` (или скорректируй миграцию `V2`).
2. Реализуй **public** GET-ы (города, классы, тарифы) + DTO.
3. **POST /public/contact** + сохранение в `contact_requests`.
4. **auth/register** и **auth/login** + Spring Security (или отдельный milestone).

## Запуск локально

См. корневой `README.md`: бэкенд `:8080`, фронт Vite с прокси `/api` → бэкенд.
