# syntax=docker/dockerfile:1
# ── Stage 1: deps ──────────────────────────────────────────────
FROM --platform=linux/amd64 qinglion-registry.cn-hangzhou.cr.aliyuncs.com/qinglion/haozanai:node-20-alpine-amd64 AS deps
WORKDIR /app

COPY example/package.json example/package-lock.json ./
COPY example/patches ./patches

# sharp 在 Alpine (musl) 上必须：
#   1. 先用 --cpu/--os/--libc 单独安装 musl 预编译二进制，写入 node_modules
#   2. 再用 npm ci 安装其余依赖（package-lock.json 里记录的是 darwin/glibc 二进制，Alpine 上无法使用）
# 这样完全不需要 vips-dev / build-base / python3，镜像更小、构建更快
RUN npm install --cpu=x64 --os=linux --libc=musl sharp \
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

# sharp 运行时需要 libvips（musl 预编译包依赖）
RUN apk add --no-cache vips \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public            ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
