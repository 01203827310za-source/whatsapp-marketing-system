# WhatsApp Marketing Campaign Management System

Production-oriented monorepo for a clothing factory WhatsApp marketing dashboard.

## Stack

- React 18, TypeScript, Vite, TailwindCSS, React Router, React Query, Zustand, React Hook Form, Zod, Axios, Recharts
- Node.js, Express, TypeScript
- PostgreSQL, Prisma
- Redis, BullMQ
- Cloudinary
- JWT, bcrypt, RBAC, audit logs, webhook signature validation

## Structure

```text
apps/
  api/
  web/
packages/
  shared/
```

## Local Setup

1. Copy `.env.example` to `.env` and fill WhatsApp and Cloudinary credentials.
2. Start dependencies:

```bash
docker compose up -d postgres redis
```

3. Install and prepare the database:

```bash
npm install
npm run db:generate
npm run db:migrate --workspace @factory/api
npm run db:seed --workspace @factory/api
```

4. Run the API, worker, and web app:

```bash
npm run dev --workspace @factory/api
npm run worker --workspace @factory/api
npm run dev --workspace @factory/web
```

## Key Endpoints

- `GET /health`
- `POST /api/auth/login`
- `GET /api/customers`
- `POST /api/campaigns`
- `POST /api/campaigns/:id/send`
- `POST /api/products/publish`
- `GET /api/analytics`
- `GET /webhook/whatsapp`
- `POST /webhook/whatsapp`

## Deployment

Railway can build with the root `Dockerfile`. Provision PostgreSQL and Redis, set the variables from `.env.example`, then deploy. The API runs migrations on deploy through `railway.json`.
