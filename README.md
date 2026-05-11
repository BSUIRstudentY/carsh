# Carsharing (пет-проект)

Монорепозиторий: **Spring Boot** API + **React** SPA + **docs** (API и БД).

## Структура

| Путь | Описание |
|------|----------|
| `backend/` | Java 21, Spring Boot 3.4, JPA, Flyway (PostgreSQL) |
| `frontend/` | Vite, React 19, React Router — гостевой сайт до регистрации |
| `docs/` | `api/rest-contract.md`, `database/schema.md`, `WORKFLOW.md` |

## Быстрый старт

**Бэкенд**

```bash
cd backend && mvn spring-boot:run
```

**Фронт**

```bash
cd frontend && npm install && npm run dev
```

- API: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)  
- SPA: адрес из вывода Vite (прокси `/api` → `8080`)

## Маршруты фронта (гость)

| Путь | Страница |
|------|----------|
| `/` | Главная (герой, оффер, CTA регистрация) |
| `/fleet` | Автопарк (под API) |
| `/tariffs` | Тарифы |
| `/about` | О сервисе |
| `/contact` | Контакты (форма → `POST /api/v1/public/contact`) |
| `/login` | Вход |
| `/register` | Регистрация |

## Бэкенд: куда писать код

См. **`docs/WORKFLOW.md`** — пакеты `domain`, `service`, `repository`, `web/public`, `web/auth`.

## API и БД

- Контракт REST: **`docs/api/rest-contract.md`**
- Описание таблиц: **`docs/database/schema.md`**
- SQL-миграция: **`backend/src/main/resources/db/migration/V1__initial_schema.sql`**

В **dev** (H2) Flyway отключён; в **prod** (PostgreSQL) Flyway включён в `application-prod.properties`.

## Профили Spring

- `dev` (по умолчанию) — H2 in-memory
- `prod` — PostgreSQL + Flyway

```bash
cd backend && SPRING_PROFILES_ACTIVE=prod mvn spring-boot:run
```
