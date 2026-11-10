# syntax=docker/dockerfile:1

# Base image with Node.js and global pnpm
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@9.10.0 && \
    apk add --no-cache libc6-compat

# -------------------------------------------------------------
# Stage 1: Dependency resolution & installation
# -------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy root monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package descriptors for layer caching
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/docs/package.json ./packages/docs/
COPY packages/products/package.json ./packages/products/
COPY packages/rate-limiting/package.json ./packages/rate-limiting/
COPY packages/test/package.json ./packages/test/

RUN pnpm install --frozen-lockfile

# -------------------------------------------------------------
# Stage 2: Monorepo builder
# -------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /pnpm /pnpm
COPY . .

# Build web application with Next.js standalone output
RUN pnpm --filter @repo/web build

# -------------------------------------------------------------
# Target 1: Next.js Web Runner (Default target)
# -------------------------------------------------------------
FROM node:20-alpine AS web
WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build and assets
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

# -------------------------------------------------------------
# Target 2: Express / tRPC Backend API Runner
# -------------------------------------------------------------
FROM base AS api
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

COPY . .

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiservice && \
    chown -R apiservice:nodejs /app

USER apiservice

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["./node_modules/.bin/tsx", "src/server.ts"]
