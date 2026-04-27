# syntax=docker/dockerfile:1
# ── Stage 1: deps ──────────────────────────────────────────────
FROM --platform=linux/amd64 qinglion-registry.cn-hangzhou.cr.aliyuncs.com/qinglion/haozanai:node-20-alpine-amd64 AS deps
WORKDIR /app

COPY example/package.json example/package-lock.json ./
COPY example/patches ./patches
# sharp 在 Alpine 上需要预装 vips 依赖的系统库
RUN apk add --no-cache vips-dev fftw-dev build-base python3 \
 && npm ci --prefer-offline

# ── Stage 2: builder ───────────────────────────────────────────
FROM --platform=linux/amd64 qinglion-registry.cn-hangzhou.cr.aliyuncs.com/qinglion/haozanai:node-20-alpine-amd64 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY example/ .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: runner ────────────────────────────────────────────
FROM --platform=linux/amd64 qinglion-registry.cn-hangzhou.cr.aliyuncs.com/qinglion/haozanai:node-20-alpine-amd64 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# sharp 运行时需要 libvips
RUN apk add --no-cache vips \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public            ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
