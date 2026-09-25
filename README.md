# CRM API — NestJS

A backend Customer Relationship Management (CRM) API built with **NestJS, TypeScript, PostgreSQL, and Prisma**.

The project focuses on a production-oriented backend architecture: authentication, authorization, validation, relational data modeling, automated testing, API documentation, and continuous integration.

## 🚀 Live Demo

**Swagger API documentation:**
`https://crm-api-nestjs.onrender.com/docs`

The live API can be explored and tested directly through Swagger UI.

> The API is deployed on Render and uses a dedicated production PostgreSQL database (Neon).

---

## 📌 Project Overview

This project is a REST API for managing core CRM data and workflows.

The API provides functionality for:

* user authentication
* role-based authorization
* companies
* contacts
* tasks
* deals
* relational data between CRM entities
* input validation
* centralized error handling
* API documentation with Swagger
* automated unit and E2E testing
* automated CI with GitHub Actions
* production deployment through Render


---

## ✨ Features

### Authentication

* User registration
* User login
* JWT-based authentication (access + refresh tokens)
* Refresh-token rotation with reuse detection and automatic session revocation
* Password hashing with bcrypt
* Protected API endpoints
* Logout / session invalidation
* Centralized authentication error handling

### Authorization

The application supports multiple user roles:

* `ADMIN`
* `MANAGER`
* `EMPLOYEE`

Authorization is enforced at the route level based on role.

---

### Companies

Companies are central CRM entities and can be associated with:

* contacts
* tasks
* deals

The API supports creating, retrieving, updating, and deleting company data, as well as querying company collections.

---

### Contacts

Contacts belong to companies and contain contact-related information.

The API supports:

* creating contacts
* retrieving contacts
* updating contacts
* deleting contacts
* filtering contacts
* company/contact relationships

---

### Tasks

Tasks can be associated with users and, optionally, companies.

Tasks support:

* status
* priority
* assignment
* task filtering
* updating task state

Available task statuses include:

* `TODO`
* `IN_PROGRESS`
* `DONE`

Available priorities include:

* `LOW`
* `MEDIUM`
* `HIGH`

---

### Deals

Deals represent sales opportunities associated with a company and an assigned user.

The application supports:

* creating deals
* retrieving deals
* updating deals
* deleting deals
* assigning deals to users
* associating deals with companies

---

## 🛠️ Tech Stack

### Backend

* **Node.js**
* **TypeScript**
* **NestJS**

### Database

* **PostgreSQL**
* **Prisma 8** (contract-based workflow)

### Authentication & Security

* **JWT**
* **bcrypt**
* **NestJS Throttler** (rate limiting on auth endpoints)

### API Documentation

* **Swagger**

### Testing

* **Vitest**
* **Supertest**

### Development & Deployment

* **GitHub Actions**
* **Render**
* **Neon PostgreSQL**

---

## 🏗️ Architecture

The application follows NestJS modular architecture, organized around domain-related modules rather than a single application layer.

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

| Role       | Purpose                                 |
| ---------- | --------------------------------------- |
| `ADMIN`    | Administrative access                   |
| `MANAGER`  | Management and team-level access        |
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

GitHub Actions runs on every push and pull request targeting `main`:

```text
Install dependencies
        ↓
Unit tests
        ↓
E2E tests
        ↓
Production build
```

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

* Node.js 24 (recommended)
* npm
* PostgreSQL (or Docker Compose)
* Git

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
Manager:
Email: [DEMO_MANAGER_EMAIL]
Password: [DEMO_MANAGER_PASSWORD]

Employee:
Email: [DEMO_EMPLOYEE_EMAIL]
Password: [DEMO_EMPLOYEE_PASSWORD]
```

---

## 🔒 Security Considerations

* Secrets are supplied through environment variables and never committed to the repository
* Production and test/CI databases are fully separated
* Passwords are hashed with bcrypt
* Refresh tokens are single-use, rotated, and hashed at rest
* Reused refresh tokens trigger automatic session revocation
* Rate limiting is applied to authentication endpoints
* Database constraint errors are normalized into consistent API responses rather than leaking raw database internals
* Internal maintenance endpoints are secret-protected, excluded from Swagger, and not part of the public API surface


---

## 🎯 Project Goals

This project was built to demonstrate practical backend development skills with a modern Node.js stack:

* structuring a modular NestJS application
* working with relational data and PostgreSQL
* implementing authentication and authorization, including refresh-token rotation
* handling validation and database errors centrally
* writing unit and E2E tests
* documenting an API with Swagger
* separating test and production environments
* implementing CI
* deploying and maintaining a live API on a free-tier host

---


## 👩‍💻 Author

**Hanna Rembiasz**

GitHub: https://github.com/HannaRembiasz

Repository: https://github.com/HannaRembiasz/crm-api-nestjs

---

## 📄 License

This project is currently intended as a portfolio and learning project.
