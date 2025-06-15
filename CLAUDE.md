## Project Overview

This nginx performance tuning project demonstrates optimization techniques for different types of web applications:
1. **nginx-json**: High-performance JSON API server using nginx as a reverse proxy to a Go backend
2. **nginx-reactjs**: Optimized configuration for React.js applications with frontend app server

The project showcases nginx optimization techniques including rate limiting, security headers, compression, caching, and other performance enhancements.

## Goals
Technical objectives:
1. Provide reusable configurations for other skeleton projects
2. Serve as a learning resource for nginx tuning beginners

## Core Principles
1. Follow nginx official documentation content and context
2. Use clear and simple language in documentation

## Infrastructure Architecture
Requests (packets) flow through the following components in order:

1. Firewall
2. CDN
3. Load Balancer
4. Nginx
5. Backend Application (JSON API App or Frontend App Server)

The HTTPS handshake is processed by the CDN or Load Balancer, so nginx serves as an HTTP proxy server only.

## Project Architecture

### nginx-json Configuration
The JSON API system consists of two main components running in Docker:
- **nginx** (port 8180): Reverse proxy with performance optimizations
- **backend_server** (Go backend, port 8080): Simple JSON API server

### nginx-reactjs Configuration
The React/Next.js system is configured for modern frontend applications:
- **nginx** (port 8280): Reverse proxy optimized for static assets and frontend apps
- **frontend_server** (port 3000): Frontend application server (React/Next.js)

### Configuration Structure
Both configurations are modularized into logical sections:
- `nginx-{json,reactjs}/basic/`: Basic HTTP settings (gzip, timeouts, logging)
- `nginx-{json,reactjs}/advanced/`: Advanced optimizations (buffer tuning, caching)
- `nginx-{json,reactjs}/server/`: Location-specific configurations (rate limiting, security)
- `nginx-{json,reactjs}/upstream/`: Connection pooling settings
- `nginx-reactjs/security/`: Security headers and CORS configuration (reactjs only)

Key differences between configurations:
- **nginx-json**: Optimized for API responses, higher buffer sizes, backend API focus
- **nginx-reactjs**: Optimized for static assets, open file caching, security headers

## Common Commands

### Development
```bash
# Start the full stack
docker compose up -d

# Rebuild after changes
docker compose build
docker compose up -d

# Stop services
docker compose down
```

### Testing
```bash
# Test JSON API endpoints
curl http://localhost:8180/json?size=100kb
curl http://localhost:8180/json?size=500kb
curl http://localhost:8180/health

# Test reactjs
curl http://localhost:8082/
```

### Backend Development
```bash
# Go backend (from backend_server/ directory)
cd backend_server
go run main.go
# or with debug
DEBUG=true go run main.go
```

### Frontend Development
```bash
# reactjs frontend (from frontend_server/ directory)
cd frontend_server
npm install
npm run dev
```

## Configuration Structure

The main nginx configs (`nginx-json.conf` and `nginx-reactjs.conf`) include modular configuration files:
- All basic settings are included from `nginx-{json,reactjs}/basic/*.conf`
- Advanced optimizations are included from `nginx-{json,reactjs}/advanced/*.conf`
- Location-specific rules use includes within server blocks
- Security configurations in `nginx-reactjs/security/*.conf`

When modifying nginx settings, edit the appropriate modular config file rather than the main config to maintain organization.

The Go backend serves test JSON files from the `json/` directory and supports size-specific requests via query parameters.
The frontend server serves a React.js application with static assets.

## Review flows
- [ ] docker compose up
  - when failed or got any exit code in docker, stop workflow and tell requester what happened
- [ ] request follow commands and get http status code as 200
  - `curl localhost:8180/json?size=100kb`
  - `curl localhost:8180/json?size=500kb`
  - `curl localhost:8280/`
  - when failed, tell requester what happened

## Custom commands
- "r" or "review" : review by "Review flows"
