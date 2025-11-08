FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client
RUN ./node_modules/.bin/prisma generate

# Copy source code
COPY . .

# Build application
RUN npx nest build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY --from=base --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nestjs:nodejs /app/dist ./dist
COPY --from=base --chown=nestjs:nodejs /app/package.json ./
COPY --from=base --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=base --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]

