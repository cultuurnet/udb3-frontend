# --------------------------------------------------
# Base: Node.js 22
# --------------------------------------------------
FROM node:22.23.4-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# --------------------------------------------------
# Builder: same steps as the deb package build in the Jenkinsfile
# (install, build, then reinstall production dependencies only)
# --------------------------------------------------
FROM base AS builder

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --network-timeout 100000

COPY . .

RUN yarn build \
    && rm -rf node_modules .next/cache \
    && yarn install --frozen-lockfile --production --network-timeout 100000 \
    && yarn cache clean

# --------------------------------------------------
# Runner
# --------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app ./

USER node

ENV HOSTNAME=0.0.0.0
ENV PORT=4000

EXPOSE 4000

CMD ["sh", "-c", "exec node node_modules/next/dist/bin/next start -H \"$HOSTNAME\" -p \"$PORT\""]
