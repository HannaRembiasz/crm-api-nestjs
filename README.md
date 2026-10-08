# CRM API — NestJS

A REST API for managing CRM data and workflows, built with **NestJS, TypeScript, PostgreSQL, and Prisma**.

The project includes JWT authentication with refresh-token rotation, role-based authorization, relational data modeling, input validation, and centralized error handling. It also features automated unit and E2E tests, Swagger documentation, and a CI pipeline.

---

## 🚀 Live Demo

**[Explore the API in Swagger UI](https://crm-api-nestjs.onrender.com/docs)**

The API is deployed on Render and connected to a separate production PostgreSQL database hosted on Neon.

Demo accounts are available for testing role-based access. See the **Demo Data** section below for credentials and instructions.

### Quick Demo

1. Open the [Swagger UI](https://crm-api-nestjs.onrender.com/docs).
2. Find `POST /auth/login` and log in using one of the demo accounts listed in the **Demo Data** section below.
3. Copy the access token from the login response.
4. Click **Authorize** in Swagger UI and enter the token.
5. Explore the protected endpoints for companies, contacts, tasks, and deals.

> The first request may take longer if the Render instance has been inactive.

---

## 📌 Project Overview

The API supports core CRM operations involving:

- **Companies** — managing company records and related entities
- **Contacts** — storing and filtering company contacts
- **Tasks** — assigning work, setting priorities, and tracking progress
- **Deals** — managing sales opportunities and user assignments
- **Users and roles** — controlling access through `ADMIN`, `MANAGER`, and `EMPLOYEE` roles

The application follows NestJS's modular structure, with separate modules for individual business domains.

---

## ✨ Features

### Authentication & Authorization

- User registration and login
- JWT authentication with access and refresh tokens
- Refresh-token rotation with reuse detection and session revocation
- Role-based access control (`ADMIN`, `MANAGER`, `EMPLOYEE`)
- Protected endpoints and logout
- Password hashing with bcrypt

### Companies

- Create, retrieve, update, and delete company records
- Query company collections
- Manage relationships with contacts, tasks, and deals

### Contacts

- Create, retrieve, update, and delete contacts
- Filter contacts
- Associate contacts with companies

### Tasks

- Create and manage tasks assigned to users
- Associate tasks with companies
- Filter tasks and update their status
- Set task priorities (`LOW`, `MEDIUM`, `HIGH`)
- Track task statuses (`TODO`, `IN_PROGRESS`, `DONE`)

### Deals

- Create, retrieve, update, and delete deals
- Assign deals to users
- Associate deals with companies

---

## 🛠️ Tech Stack

### Backend

- **Node.js**
- **TypeScript**
- **NestJS**

### Database

- **PostgreSQL**
- **Prisma 8** (contract-based workflow)

### Authentication & Security

- **JWT**
- **bcrypt**
- **NestJS Throttler** (rate limiting on auth endpoints)

### API Documentation

- **Swagger**

### Testing

- **Vitest**
- **Supertest**

### Development & Deployment

- **GitHub Actions**
- **Render**
- **Neon PostgreSQL**

---

## 🏗️ Architecture

The application is organized into domain-specific NestJS modules:

```text
src/
├── app.module.ts
├── main.ts
├── auth/
├── common/
├── companies/
├── contacts/
├── deals/
├── internal/
├── prisma/
├── stats/
├── tasks/
└── users/

test/
├── auth.e2e-spec.ts
├── authorization.e2e-spec.ts
├── rate-limiting.e2e-spec.ts
├── resources.e2e-spec.ts
├── stats.e2e-spec.ts
└── validation.e2e-spec.ts
```

Each feature module is responsible for its own controllers, services, DTOs, and related business logic — keeping the application modular and easier to test and extend.

---

## 🔐 Authentication

Authentication uses JWT access tokens backed by a database-tracked session.

### Register

```http
POST /auth/register
```

Creates a new user account.

### Login

```http
POST /auth/login
```

Authenticates the user and returns an access token, with a refresh token set as an HTTP-only cookie.

### Refresh

```http
POST /auth/refresh
```

Rotates the refresh token and issues a new access token. Reused or invalid refresh tokens revoke the associated session.

### Logout

```http
POST /auth/logout
```

Invalidates the current session.

Protected endpoints require:

```http
Authorization: Bearer <token>
```

Swagger UI is configured to support JWT authentication, allowing protected endpoints to be tested directly from the live API documentation.

---

## 👥 Roles & Authorization

| Role | Purpose |
| --- | --- |
| `ADMIN` | Administrative access |
| `MANAGER` | Management and team-level access |
| `EMPLOYEE` | Restricted access to assigned resources |

Authorization is handled via role checks applied at the route level.

---

## 🗄️ Database

The application uses **PostgreSQL** as its relational database, accessed through **Prisma 8's contract-based workflow** rather than a traditional `schema.prisma` file.

The contract is located at:

```text
src/prisma/contract.prisma
```

---

## 📖 API Documentation

Once the application is running locally, Swagger UI is available at:

```text
http://localhost:3000/docs
```

The production Swagger URL is listed at the top of this README.

Swagger provides available endpoints, request/response schemas, validation requirements, and built-in JWT authentication support.

After logging in via `/auth/login`, the token can be entered into Swagger's **Authorize** dialog to test protected endpoints.

---

## 🧪 Testing

The project uses **Vitest** for automated testing.

### Unit tests

```bash
npm test
```

### E2E tests

```bash
npm run test:e2e
```

E2E tests run against a dedicated test database loaded from `.env.test` and verify the API through real HTTP requests, covering registration, validation, login, protected routes, refresh/logout behavior, and authorization.

### Build

```bash
npm run build
```

---

## 🔄 Continuous Integration

GitHub Actions runs on every push and pull request targeting `main`.

The CI pipeline:

1. Installs dependencies with `npm ci`
2. Runs unit tests
3. Runs E2E tests
4. Builds the application

CI uses a dedicated test database configured through GitHub Actions secrets.

---

## 🚀 Deployment

The API is deployed to **Render**, with Render automatically deploying changes pushed to `main`.

```text
Git push
   │
   ├──→ GitHub Actions
   │       ├── npm ci
   │       ├── unit tests
   │       ├── E2E tests
   │       └── build
   │
   └──→ Render
           └── production deployment
```

Uptime is maintained via scheduled external health checks, and the production database is kept fully separate from the database used by CI/E2E tests.

---

## ⚙️ Local Development

### Requirements

- Node.js 24 (recommended)
- npm
- PostgreSQL (or Docker Compose)
- Git

### Clone the repository

```bash
git clone https://github.com/HannaRembiasz/crm-api-nestjs.git
```

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file with the required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"
JWT_SECRET="replace_with_a_strong_secret"
MAINTAIN_DB_SECRET="replace_with_a_secure_internal_secret"
```

Do not commit real secrets to the repository.

### Start PostgreSQL locally (optional, via Docker)

```bash
docker compose up -d postgres
```

### Apply the Prisma contract to your database

```bash
npm run contract:emit
npx prisma db init --db "$DATABASE_URL"
```

### Seed base accounts

```bash
npm run seed
```

---

## ▶️ Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

The API is available at `http://localhost:3000`, with Swagger at `http://localhost:3000/docs`.

---

## 🌱 Demo Data

The production deployment includes seeded demo data so the API can be explored without creating a dataset manually.

### Demo accounts

> Manager and employee demo accounts can be used to explore role-restricted behavior.

```text
Employee:
Email: employee@mail.com
Password: employee.password

Manager:
Email: manager@mail.com
Password: manager.password
```

To test role-based access, log in with either account through `POST /auth/login`, copy the returned access token, and use Swagger's **Authorize** button to authenticate subsequent requests.

---

## 🔒 Security Considerations

- Secrets are supplied through environment variables and never committed to the repository
- Production and test/CI databases are fully separated
- Passwords are hashed with bcrypt
- Refresh tokens are single-use, rotated, and hashed at rest
- Reused refresh tokens trigger automatic session revocation
- Rate limiting is applied to authentication endpoints
- Database constraint errors are normalized into consistent API responses rather than leaking raw database internals
- Internal maintenance endpoints are secret-protected, excluded from Swagger, and not part of the public API surface

---

## 👩‍💻 Author

GitHub: [Hanna Rembiasz Profile](https://github.com/HannaRembiasz)

---

## 📄 License

No license has been specified for this repository.
