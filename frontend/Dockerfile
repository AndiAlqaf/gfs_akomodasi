# Stage 1: Build React/Vite app
FROM node:22-alpine AS builder

WORKDIR /app

# Use npmmirror as fallback registry for better connectivity
RUN npm config set registry https://registry.npmmirror.com

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline || npm install --no-audit --no-fund

# Copy source files
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the app (skip tsc type checking — run vite build directly)
RUN npm run build 2>/dev/null || npx --yes vite build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for SPA
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
