# Social Backend (Spring Boot)

Overview
- Spring Boot backend using PostgreSQL and JWT-based auth.

Quick start (local dev)

Option A — Quick dev (no Docker, uses in-memory H2)
1. From project root run the helper script (PowerShell):
   ./backend/run-backend-dev.ps1
   This starts the backend with the `dev` Spring profile (H2 in-memory DB, debug endpoints on).

Option B — Docker Compose (Postgres)
1. From project root run the helper script (PowerShell):
   ./run-backend-docker.ps1
   This will build the backend image and start the `db` and `backend` services as defined in `docker-compose.yml`.

Option C — Start backend + frontend together
1. From project root run the helper script (PowerShell):
   ./run-dev-all.ps1         # starts backend (dev) and opens frontend in a new terminal
   ./run-dev-all.ps1 -UseDocker   # starts Docker Compose (db + backend) then opens frontend

Note: If you prefer manual commands:
- mvn -Dspring-boot.run.profiles=dev spring-boot:run  (uses H2 dev profile)
- docker compose up -d --build  (Docker Compose, requires Docker Desktop)

Docker
- Build backend image and run with compose (add service entries to docker-compose if you want backend to run in compose).

Notes
- JWT secret in `application.properties` must be set to a secure key (>= 32 chars) for production.
- Flyway migrations are placed in `src/main/resources/db/migration`.
