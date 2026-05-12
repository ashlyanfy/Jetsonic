FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev && npx prisma generate && npm cache clean --force

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
