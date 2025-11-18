# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
# Copy package files
COPY package.json package-lock.json* ./
COPY ./PDFs ./PDFs
# Install all dependencies from package-lock.json (dev + production) and build
RUN npm ci && npm cache clean --force

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
# Copy package files
COPY --from=deps /app ./ 
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy built application with correct permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
ENTRYPOINT ["npm", "run", "start"]