# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Carsharing monorepo — Spring Boot 3.4 API (Java 21) + Vite/React 19 SPA (TypeScript).
See root `README.md` for structure, `docs/WORKFLOW.md` for architecture conventions.

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Backend | `cd backend && mvn spring-boot:run` | 8080 | Dev profile uses H2 in-memory DB (no external DB needed). Flyway seeds schema + data on startup. |
| Frontend | `cd frontend && npm run dev` | 5173 | Vite proxies `/api` → `localhost:8080`. |

Both services must run for end-to-end testing.

### Lint / Test / Build

| Check | Command | Working dir |
|-------|---------|-------------|
| Backend compile+test | `mvn test` | `backend/` |
| Frontend lint (ESLint) | `npm run lint` | `frontend/` |
| Frontend build (TS + Vite) | `npm run build` | `frontend/` |

**Note:** The frontend lint currently has pre-existing `react-hooks/set-state-in-effect` warnings from the codebase (5 errors, 1 warning). These are not introduced by new changes.

### Key gotchas

- **Login endpoint** uses field `identifier` (not `email` or `login`): `POST /api/v1/auth/login {"identifier":"...","password":"..."}`.
- **Registration** returns JWT tokens immediately (auto-login on register).
- The `POST /api/v1/public/contact` endpoint documented in `rest-contract.md` does not appear to be implemented yet (returns 404).
- Maven is required as a system dependency (`sudo apt-get install -y maven`).
- Java 21 (OpenJDK) is pre-installed on the VM.
- Node 22 + npm 10 are pre-installed on the VM.
