FROM node:16-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend ./

# Build the application (if needed, e.g., for transpiling)
# RUN npm run build

FROM node:16-alpine AS production

WORKDIR /app

COPY --from=builder /app ./

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "app.js"]