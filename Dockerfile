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

# ---- Final backend image ----
FROM base AS backend
WORKDIR /app

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy pre-installed node_modules from build context then source files.
# node_modules are pre-installed on the host (yarn setup) and copied in
# because the Docker build environment may lack outbound internet access.
COPY --chown=appuser:appgroup test-backend/node_modules ./node_modules
COPY --chown=appuser:appgroup test-backend/package.json ./
COPY --chown=appuser:appgroup test-backend/index.js ./
COPY --chown=appuser:appgroup test-backend/src ./src

USER appuser

EXPOSE 5000

# Health check: hit the root endpoint which returns a 200 text response
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["node", "index.js"]

# =============================================================================
# FRONTEND
# =============================================================================

# ---- Final frontend image ----
# We copy all deps and source, then build at container start because the
# Next.js build pre-renders server components that fetch from the backend API.
# The API must be reachable at build time, which is only guaranteed when the
# container runs inside the Compose network (not during `docker build`).
FROM base AS frontend
WORKDIR /app

# Run as non-root for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy pre-installed node_modules from the build context
COPY --chown=appuser:appgroup frontend/node_modules ./node_modules

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
