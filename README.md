# nginx-tune

## Quick Read

**What is this**
Basic catalogue of 'make response of application/json faster'

**Reading guides**
1. Just want configs: Copy `nginx-json/` directory
2. Need only basic settings: [nginx-json/README.md](./nginx-json/README.md) and [Basic README.md](nginx-json/basic/README.md)
3. Need advanced settings: [Advanced README.md](nginx-json/advanced/README.md)
4. Need to know worker settings: [worker.md](nginx-json/worker.md)

```bash
docker compose up -d

curl http://localhost:8180/json?size=100kb
# or
curl http://localhost:8180/json?size=500kb

docker compose down
```

## Architecture

- **nginx**: Reverse proxy
- **tserver(test sever)** Golang's simple backend

```
Client > nginx:8180 > tserver:8080
         +
         > Tuned configs, Rate limiting, Minimal security, Logs
```

## Configuration Structure

```
nginx-json/
├── main.conf                 # Worker processes and limits
├── events.conf               # Connection handling
├── basic/                    # Core optimizations
│   ├── transfer.conf         #   Network basics
│   ├── gzip.conf             #   Compression
│   ├── client_timeout.conf   #   Timeout
│   ├── log_format.conf       #   log
│   └── proxy_timeout.conf    #   Backend timeouts
├── advanced/                 # Buffer tuning
│   ├── client_buffers.conf   #   Request buffer
│   └── proxy_buffers.conf    #   Response buffer
├── server/                   # Endpoint configurations
│   ├── root/main.conf        #   API endpoint with security
│   └── health/main.conf      #   Health check endpoint
└── upstream/                 # Backend configuration
    └── backend_api.conf      #   Connection pooling
```

## Key Features

- [nginx-json/README.md](./nginx-json/README.md)
  - [worker.md](./nginx-json/worker.md)
- [basic/README.md](./nginx-json/basic/README.md)
- [advanced/README.md](./nginx-json/advanced/README.md)

## Endpoints

```bash
# 100KB response
curl http://localhost:8180/json?size=100kb

# 500KB response
curl http://localhost:8180/json?size=500kb
```

## Dev

1. Edit config file(s) in `nginx-json/`
2. Rebuild and restart: `docker-compose build; docker compose up -d`
3. Test

**Golang Backend**

```bash
cd test_server
DEBUG=true
go run main.go

curl localhost:8080/json?size=100kb
```

## 404 - other usecases like uploading, websocket, etc

no plans

## License

MIT
