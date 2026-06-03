FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm ci --workspace @factory/web --workspace @factory/shared --include-workspace-root

RUN npm run build --workspace @factory/web

FROM caddy:2-alpine AS web

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist ./dist

EXPOSE 3000

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
