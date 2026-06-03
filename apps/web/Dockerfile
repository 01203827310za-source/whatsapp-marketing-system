FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json ./
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm install

COPY . .

RUN printf '%s\n' \
  '{' \
  '  "compilerOptions": {' \
  '    "target": "ES2020",' \
  '    "useDefineForClassFields": true,' \
  '    "lib": ["ES2020", "DOM", "DOM.Iterable"],' \
  '    "allowJs": false,' \
  '    "skipLibCheck": true,' \
  '    "esModuleInterop": true,' \
  '    "allowSyntheticDefaultImports": true,' \
  '    "strict": true,' \
  '    "forceConsistentCasingInFileNames": true,' \
  '    "module": "ESNext",' \
  '    "moduleResolution": "Node",' \
  '    "resolveJsonModule": true,' \
  '    "isolatedModules": true,' \
  '    "noEmit": true,' \
  '    "baseUrl": "."' \
  '  }' \
  '}' \
  > /tsconfig.base.json

RUN npm run build

FROM caddy:2-alpine AS web

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
