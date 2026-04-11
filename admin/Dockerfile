# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY package.json package-lock.json* ./
RUN npm ci --include=dev
COPY index.html vite.config.js ./
COPY js/ js/
COPY styles/ styles/
COPY services/ services/
COPY public/ public/
COPY components/ components/
COPY privacy-policy.html terms-of-service.html ./
RUN npm run build

# Stage 2: Admin server
FROM node:18-alpine

# better-sqlite3 requires build tools for native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy admin package files first for layer caching
COPY admin/package.json admin/package-lock.json* ./
RUN npm ci --omit=dev

# Copy admin application code
COPY admin/src/ src/
COPY admin/views/ views/
COPY admin/public/ public/

# Copy built frontend into admin's static serving directory
COPY --from=frontend-build /frontend/dist public/site/

# Create data directory for SQLite persistence
RUN mkdir -p /data

# Default environment
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/onix.db

EXPOSE 3001

# Health check using Node.js (wget/curl not guaranteed in Alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "const http=require('http');http.get('http://localhost:3001/api/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1)).setTimeout(4000,function(){this.destroy();process.exit(1)})"

CMD ["node", "src/server.js"]
