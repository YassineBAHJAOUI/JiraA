# Multi-stage build
FROM node:22-alpine AS builder

ARG http_proxy
ARG https_proxy
ARG VERSION
ARG IMAGE_NAME

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Runtime stage
FROM node:22-alpine

ARG IMAGE_NAME
ARG VERSION

RUN apk add --no-cache curl tini

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

LABEL p0267.${IMAGE_NAME}.contact="alternant@appops.fr"
LABEL p0267.${IMAGE_NAME}.equipe="AppOps"
LABEL p0267.${IMAGE_NAME}.version="${VERSION}"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
