FROM node:20-alpine AS base

WORKDIR /app

# Install OpenSSL and other dependencies required by Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy package files
COPY package.json yarn.lock* ./

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client
RUN ./node_modules/.bin/prisma generate

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL and build dependencies required by Prisma and native modules
RUN apk add --no-cache openssl openssl-dev python3 make g++

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY --from=base --chown=nestjs:nodejs /app/package.json ./
COPY --from=base --chown=nestjs:nodejs /app/yarn.lock* ./

# Copy Prisma schema
COPY --from=base --chown=nestjs:nodejs /app/prisma ./prisma

# Install only production dependencies and rebuild native modules
RUN yarn install --frozen-lockfile --production && \
    chown -R nestjs:nodejs /app

# Copy built application and Prisma client
COPY --from=base --chown=nestjs:nodejs /app/dist ./dist
COPY --from=base --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]

