# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for Prisma)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy package files and install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy Prisma files and generated client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy source code
COPY --chown=expressjs:nodejs src ./src

# Create uploads directory
RUN mkdir -p uploads/comments uploads/documents && chown -R expressjs:nodejs uploads

# Set user
USER expressjs

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "src/index.js"]
