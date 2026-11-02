# --- 阶段 1: 构建阶段 ---
# 使用 Node.js 22 官方镜像作为基础
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm（全局）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 🔑 设置环境变量（只影响当前容器）
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com/

# 复制包管理文件
COPY package.json pnpm-lock.yaml* ./
# 安装依赖（生产环境）
RUN pnpm install --frozen-lockfile

# 复制所有源代码
COPY . .

# 设置生产环境变量
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# --- 阶段 2: 运行时阶段 ---
# 使用更小的运行时镜像
FROM node:22-alpine AS runner
WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production
# 禁用 Next.js 的遥测功能
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户（安全考虑）
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 从构建阶段复制必要文件
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

# 暴露端口.  ***具体项目具体修改***
EXPOSE 3001

# 启动命令
CMD ["node", "server.js"]