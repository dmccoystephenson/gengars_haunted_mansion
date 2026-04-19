# =============================================================================
# Gengar's Haunted Mansion — Multi-target Dockerfile
# =============================================================================
# This Dockerfile supports two build targets:
#   1. "backend"  — Express.js API server
#   2. "frontend" — Next.js web application
#
# Build a specific target with:
#   docker build --target backend  -t gengars-api .
#   docker build --target frontend -t gengars-app .
#
# Node 24 Alpine is used to match the engines field in package.json while
# keeping the image small (~180 MB base).
# =============================================================================

# ---- Base stage: shared Node.js runtime ----
FROM node:24-alpine AS base

# =============================================================================
# BACKEND
# =============================================================================

# ---- Install backend production dependencies inside Docker ----
FROM base AS backend-deps
WORKDIR /app
COPY test-backend/package.json test-backend/yarn.lock ./
RUN yarn install --production --frozen-lockfile

# ---- Final backend image ----
FROM base AS backend
WORKDIR /app

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production deps from the deps stage (ensures Linux/musl-compatible binaries)
COPY --from=backend-deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy only the source files needed at runtime (no tests, no dev configs)
COPY --chown=appuser:appgroup test-backend/package.json ./
COPY --chown=appuser:appgroup test-backend/index.js ./
COPY --chown=appuser:appgroup test-backend/src ./src

USER appuser

EXPOSE 5000

# Health check: use $PORT so the check follows the runtime port configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD sh -c 'wget --no-verbose --tries=1 --spider "http://localhost:${PORT:-5000}/" || exit 1'

CMD ["node", "index.js"]

# =============================================================================
# FRONTEND
# =============================================================================

# ---- Install frontend dependencies inside Docker ----
FROM base AS frontend-deps
WORKDIR /app
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

# ---- Final frontend image ----
# Next.js production builds pre-render server components that fetch from the
# backend API. The API is not reachable during `docker build`, so we run in
# dev mode which renders on-demand instead.
FROM base AS frontend
WORKDIR /app

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy deps from the deps stage (ensures Linux/musl-compatible binaries)
COPY --from=frontend-deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application source and config files
COPY --chown=appuser:appgroup frontend/package.json frontend/next.config.js ./
COPY --chown=appuser:appgroup frontend/postcss.config.js frontend/tailwind.config.js ./
COPY --chown=appuser:appgroup frontend/jsconfig.json ./
COPY --chown=appuser:appgroup frontend/app ./app
COPY --chown=appuser:appgroup frontend/articles ./articles
COPY --chown=appuser:appgroup frontend/data ./data
COPY --chown=appuser:appgroup frontend/helperFunctions ./helperFunctions
COPY --chown=appuser:appgroup frontend/public ./public

# Create .next build output directory writable by appuser (needed at startup)
RUN mkdir -p .next && chown appuser:appgroup .next

USER appuser

EXPOSE 3000

# Health check: verify the Next.js server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Run in dev mode because Next.js production builds pre-render server
# components that fetch from the backend API. Without modifying source files
# to add `export const dynamic = 'force-dynamic'`, the build fails when the
# API is unreachable during `docker build`. Dev mode renders on-demand instead.
CMD ["npx", "next", "dev", "-p", "3000"]
