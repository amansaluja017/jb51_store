# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate
RUN apk add --no-cache libc6-compat

# 1. Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/docs/package.json ./packages/docs/
COPY packages/products/package.json ./packages/products/
COPY packages/rate-limiting/package.json ./packages/rate-limiting/
COPY packages/test/package.json ./packages/test/

RUN pnpm install --frozen-lockfile

# 2. Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /pnpm /pnpm
COPY . .

# Build workspace packages
RUN pnpm --filter @repo/api build || true

# 3. Production runner
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiservice

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /pnpm /pnpm
COPY --from=builder --chown=apiservice:nodejs /app ./

USER apiservice

EXPOSE 3001

CMD ["pnpm", "--filter", "@repo/api", "start"]
