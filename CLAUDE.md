## Project Overview

This nginx performance tuning project sets up a high-performance JSON API server using nginx as a reverse proxy to a Go backend. The project demonstrates nginx optimization techniques for JSON APIs, including rate limiting, security, compression, and other performance enhancements.

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
5. JSON API App

The HTTPS handshake is processed by the CDN or Load Balancer, so nginx serves as an HTTP proxy server only.

## Project Architecture
The system consists of two main components running in Docker:
- **nginx** (port 8180): Reverse proxy with performance optimizations
- **test-server** (Go backend, port 8080): Simple JSON API server

The nginx configuration is modularized into logical sections:
- `nginx-json/basic/`: Basic HTTP settings (gzip, timeouts, logging)
- `nginx-json/advanced/`: Advanced optimizations (buffer tuning)
- `nginx-json/server/`: Location-specific configurations (rate limiting, security)
- `nginx-json/upstream/`: Backend connection pooling settings

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
# Test the API endpoints
curl http://localhost:8180/json?size=100kb
curl http://localhost:8180/json?size=500kb

# Test health endpoint
curl http://localhost:8180/health
```

### Go Backend Development
```bash
# Build and run locally (from test_server/ directory)
cd test_server
DEBUG=true ./main
go run main.go
```

## Configuration Structure

The main nginx config (`nginx-json.conf`) includes modular configuration files:
- All basic settings are included from `nginx-json/basic/*.conf`
- Advanced optimizations are included from `nginx-json/advanced/*.conf`
- Location-specific rules use includes within server blocks

When modifying nginx settings, edit the appropriate modular config file rather than the main config to maintain organization.

The Go backend serves test JSON files from the `json/` directory and supports size-specific requests via query parameters.

## Review flows
- [ ] docker compose up
  - when failed or got any exit code in docker, stop workflow and tell requester what happened
- [ ] request follow commands and get http status code as 200
  - `curl localhost:8081/json?size=100kb`
  - `curl localhost:8081/json?size=500kb`
  - when failed, tell requester what happened

## Custom commands
- "r" or "review" : review by "Review flows"
