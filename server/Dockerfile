FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY server/package.json server/
COPY shared/package.json shared/
COPY contracts/package.json contracts/
COPY client/package.json client/

RUN bun install --ignore-scripts

COPY . .

RUN bun run build:shared
RUN cd server && bun run build

FROM oven/bun:latest AS runtime

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/bun.lock .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/dist ./dist

CMD ["bun", "dist/server/src/index.js"]