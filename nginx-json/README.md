# nginx-json configs

## Overview

```
nginx-json/
├── README.md
├── main.conf                 # Main context settings (worker processes, file limits)
├── events.conf               # Event processing configuration
├── basic/                    # Basic performance settings
│   ├── README.md
│   ├── client_timeout.conf   # Client connection timeouts
│   ├── gzip.conf            # Response compression
│   ├── log_format.conf      # Structured logging formats
│   ├── proxy_timeout.conf   # Backend proxy timeouts
│   └── transfer.conf        # Network transfer optimization
├── advanced/                 # Advanced performance tuning
│   ├── README.md
│   ├── client_buffers.conf  # Client request buffer settings
│   └── proxy_buffers.conf   # Backend proxy buffer settings
├── server/                   # Location-specific configurations
│   ├── root/
│   │   └── main.conf        # API endpoint settings (rate limiting, security)
│   └── health/
│       └── main.conf        # Health check endpoint
└── upstream/
    └── backend_api.conf     # Backend connection pooling
```

## Directory and Configuration Details

### [main.conf](./main.conf)

`main` context settings that control the fundamental behavior of nginx worker processes.

**`worker_processes`**

Sets the number of worker processes to handle requests.
Each worker runs in a separate process and can handle many connections simultaneously.
Setting this to the number of CPU cores (or 'auto') maximizes server utilization.

**`worker_rlimit_nofile`**

Maximum number of files (including sockets) each worker process can open.
This should be set higher than worker_connections since each connection uses at least one file descriptor.
Critical for handling many concurrent connections.

**`error_log`**

Configures error logging to only capture critical errors, reducing disk I/O for high-traffic servers. In development, you might use 'warn' or 'error' for more detailed debugging.

**`pid`**

Specifies where nginx stores its process ID.
This file is used by system init scripts and monitoring tools to manage the nginx service.

### [events.conf](./events.conf)

`events` context settings that control how nginx handles connections at the network level.

**`worker_connections`**

Maximum number of simultaneous connections each worker process can handle.
This should be tuned based on available memory and expected traffic.

**`use epoll`**

Specifies the event processing method.
`epoll` is the efficient method on Linux for handling many connections,
providing O(1) performance regardless of the number of connections.

**`multi_accept`**

Allows worker processes to accept all new connections at once instead of one at a time.
This improves performance under high load by reducing the overhead of accepting connections.

### basic/*.conf

Basic performance settings for fundamental nginx optimizations. Read [basic/README.md](./basic/README.md)

### [advanced/*.conf](./advanced/)

Advanced performance settings for buffer tuning and memory optimization. Read [advanced/README.md](./advanced/README.md)

### [server/**/*.conf](./server/)

Location-specific configurations for different API endpoints.

#### server/root/main.conf

Main API endpoint configuration with security and rate limiting.

**Rate Limiting Configuration**

- `limit_req zone=api_rate_limit burst=20 delay=10`:
  - Applies rate limiting using the api_rate_limit zone (defined in basic/ratelimit_zone.conf)
  - Allows bursts of up to 20 requests with the first 10 processed immediately
- `limit_req_status 429`:
  - Returns HTTP 429 (Too Many Requests) when rate limit is exceeded.
- Rate limit headers provide client feedback on their current limits.

**Security Filtering**

- Request URI filtering blocks common injection attacks (SQL injection, XSS, directory traversal).
- User agent filtering blocks known security scanning tools.
- Returns 403 Forbidden for suspicious requests.

**Proxy Configuration**

**`proxy_pass`**

Forwards requests to the backend Go server.

**`proxy_http_version 1.1`** with **`connection ""`**

Enables HTTP/1.1 keep-alive to backend.

Headers preserve client information for backend logging and security.

**`proxy_request_buffering off`**

Streams request bodies directly to backend without buffering.

**`proxy_socket_keepalive on`**

Maintains persistent TCP connections to backend.

#### server/health/main.conf

Lightweight nginx health check endpoint, that returns a static JSON response without proxying to backend.

### [upstream/*.conf](./upstream/)

Backend server pool configuration for connection management.

**`backend_api.conf`**

Defines the backend API server pool with connection pooling optimizations.

**`server backserver:8080`**

Specifies the backend server address (using Docker network name).

**`keepalive {N}`**

Maintains up to {N} idle connections to the backend for reuse.

**`keepalive_requests {N}`**

Allows up to {N} requests per kept-alive connection.

**`keepalive_timeout {N}s`**

Keeps idle backend connections open for {N} seconds.
