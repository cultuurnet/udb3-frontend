# --------------------------------------------------
# Base: Node.js 22
# --------------------------------------------------
FROM node:22-alpine AS base

# --------------------------------------------------
# Deps: install all dependencies needed for building
# --------------------------------------------------
FROM base AS deps

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --network-timeout 100000

# --------------------------------------------------
# Builder: build the Next.js app
# --------------------------------------------------
FROM base AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=secret,id=sentry_auth_token \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token 2>/dev/null || echo "WARNING: sentry_auth_token not provided, skipping source map upload") \
    yarn build

# --------------------------------------------------
# Runner: standalone output with minimal footprint
# --------------------------------------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE $PORT

CMD ["node", "server.js"]
