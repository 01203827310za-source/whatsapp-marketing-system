FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts

COPY index.html ./
COPY tsconfig.json vite.config.ts ./
COPY postcss.config.js tailwind.config.ts ./
COPY src ./src

RUN npm run build

FROM caddy:2-alpine AS web

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
