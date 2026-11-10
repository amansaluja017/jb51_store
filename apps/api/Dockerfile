# syntax=docker/dockerfile:1

FROM node:20-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install pnpm globally and native compatibility libraries
RUN npm install -g pnpm@9.10.0 && \
    apk add --no-cache libc6-compat

WORKDIR /app

# 1. Copy monorepo package manifests for Docker layer caching
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

# 2. Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# 3. Copy application and package source code
COPY . .

# 4. Set up non-root execution
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiservice && \
    chown -R apiservice:nodejs /app

USER apiservice

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["./node_modules/.bin/tsx", "src/server.ts"]
