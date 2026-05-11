# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Carsharing monorepo — Spring Boot 3.4 API (Java 21) + Vite/React 19 SPA (TypeScript).
See root `README.md` for structure, `docs/WORKFLOW.md` for architecture conventions.

### Infrastructure

Docker Compose provides Kafka + MongoDB for telemetry:
```bash
docker compose up -d   # starts MongoDB :27017, Kafka :9092, Zookeeper
```

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Infrastructure | `docker compose up -d` | 27017, 9092 | MongoDB + Kafka (required for telemetry features) |
| Backend | `cd backend && mvn spring-boot:run` | 8080 | Dev profile: H2 for SQL, MongoDB for telemetry. Flyway seeds data on start. |
| Frontend | `cd frontend && npm run dev` | 5173 | Vite proxies `/api` → `localhost:8080`. |

All three must run for full end-to-end testing.

### Lint / Test / Build

| Check | Command | Working dir |
|-------|---------|-------------|
| Backend compile+test | `mvn test` | `backend/` |
| Frontend lint (ESLint) | `npm run lint` | `frontend/` |
| Frontend build (TS + Vite) | `npm run build` | `frontend/` |

**Note:** The frontend lint has pre-existing `react-hooks/set-state-in-effect` warnings (not introduced by new changes).

### Auth & Roles

- **Admin credentials (dev):** `admin@carsharing.by` / `Admin123!`
- **Login endpoint** uses field `identifier` (email or phone): `POST /api/v1/auth/login {"identifier":"...","password":"..."}`.
- **Registration** returns JWT tokens immediately (auto-login on register).
- JWT contains `role` claim (`USER` or `ADMIN`). Admin routes at `/api/v1/admin/**` require `ROLE_ADMIN`.

### Key API routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/api/v1/public/**` | No | Public catalog, tariffs, contact form |
| `/api/v1/auth/**` | No | Register, login, refresh, logout |
| `/api/v1/bookings/**` | User | Start/end rental, history, GPS route |
| `/api/v1/telemetry/**` | No | Simulate telemetry, view vehicle routes |
| `/api/v1/admin/**` | Admin | Users, vehicles, bookings, stats |

### Telemetry pipeline

1. `POST /api/v1/telemetry/simulate/batch` sends GPS points to Kafka topic `vehicle-telemetry`
2. `TelemetryKafkaConsumer` reads from Kafka and stores in MongoDB `telemetry_points` collection
3. `GET /api/v1/bookings/{id}/route` retrieves route from MongoDB with distance/speed calc

### Key gotchas

- Maven is required as a system dependency (`sudo apt-get install -y maven`).
- Docker must be running before backend starts (for MongoDB/Kafka connections).
- Java 21 (OpenJDK) is pre-installed on the VM.
- Node 22 + npm 10 are pre-installed on the VM.
- H2 in-memory DB resets on every backend restart (dev profile).
