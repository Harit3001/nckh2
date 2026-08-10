FROM oven/bun:latest AS deps
WORKDIR /app

COPY package.json bun.lock .
COPY client/package.json client/
COPY shared/package.json shared/
COPY contracts/package.json contracts/
COPY server/package.json server/

RUN bun install --ignore-scripts

COPY . .
RUN bun run build:client

FROM nginx:alpine AS runtime
COPY --from=deps /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
