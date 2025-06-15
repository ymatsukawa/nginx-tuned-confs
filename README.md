# nginx-tune

## Quick Read

**What is this**
Performance tuning configurations for nginx serving different application types:
- **nginx-json**: Optimized for JSON API backends
- **nginx-reactjs**: Optimized for React/Next.js frontend applications

**Reading guides**
1. For JSON APIs: Start with [nginx-json/README.md](./nginx-json/README.md)
2. For React/Frontend apps: Start with [nginx-reactjs/README.md](./nginx-reactjs/README.md)
3. Need basic optimizations: See respective `basic/README.md` files
4. Need advanced tuning: See respective `advanced/README.md` files
5. Worker process tuning: [nginx-json/worker.md](nginx-json/worker.md)

```bash
docker compose up -d

# Test JSON API
curl http://localhost:8180/json?size=100kb
curl http://localhost:8180/json?size=500kb

# Test React app (when implemented)
curl http://localhost:8280/

docker compose down
```

## Architecture

**nginx-json setup**:
```
Client > nginx:8180 > backend_server:8080
         +
         > API optimizations, Rate limiting, Security headers
```

**nginx-reactjs setup**:
```
Client > nginx:8280 > frontend_server:3000
         +
         > Static asset caching, Compression, Security headers
```

## Configuration Structure

Both nginx configurations follow similar modular structure:

```
nginx-{json,reactjs}/
├── main.conf                 # Worker processes and limits
├── events.conf               # Connection handling
├── basic/                    # Core optimizations
│   ├── transfer.conf         #   Network basics
│   ├── gzip.conf             #   Compression
│   ├── client_timeout.conf   #   Timeout settings
│   ├── log_format.conf       #   Logging configuration
│   └── proxy_timeout.conf    #   Backend timeouts
├── advanced/                 # Advanced tuning
│   ├── client_buffers.conf   #   Request buffers
│   ├── proxy_buffers.conf    #   Response buffers (json only)
│   └── cache.conf            #   File caching (reactjs only)
├── security/                 # Security configurations (reactjs only)
│   ├── header.conf           #   Security headers
│   ├── cors.conf             #   CORS settings
│   └── basic_auth.conf       #   Authentication
├── server/                   # Location configurations
│   ├── root/main.conf        #   Main endpoint
│   └── health/main.conf      #   Health check
└── upstream/                 # Backend configuration
    └── backend_api.conf      #   Connection pooling
```

## Key Features

**nginx-json** (JSON API optimization):
- High-performance buffer tuning for JSON payloads
- Optimized proxy settings for backend APIs
- Rate limiting and security headers
- See: [nginx-json/README.md](./nginx-json/README.md)

**nginx-reactjs** (Frontend app optimization):
- Open file cache for static assets
- Optimized compression for JS/CSS files
- Security headers (CORS, XSS protection)
- See: [nginx-reactjs/README.md](./nginx-reactjs/README.md)

## Testing

```bash
# JSON API endpoints
curl http://localhost:8180/json?size=100kb
curl http://localhost:8180/json?size=500kb
curl http://localhost:8180/health

# React app (when implemented)
curl http://localhost:8280/
```

## Development

**Working with configurations**:
1. Edit config files in `nginx-json/` or `nginx-reactjs/`
2. Rebuild: `docker compose build`
3. Restart: `docker compose up -d`
4. Test endpoints

**Backend development**:
```bash
cd backend_server
go run main.go
# or with debug
DEBUG=true go run main.go
```

**Frontend development**:
```bash
cd frontend_server
npm install
npm run dev
```

## 404 - other usecases like uploading, websocket, etc

no plans

## License

MIT
