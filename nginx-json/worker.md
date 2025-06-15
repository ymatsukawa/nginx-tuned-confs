# Worker Settings in Nginx

## What is a Worker

In Nginx, a **worker process** is the actual process that handles client requests.
When Nginx starts, it creates:

1. **Master Process**: Manages worker processes, reads configuration, binds to ports
2. **Worker Processes**: Handle actual connections and requests from clients

Think of it like a restaurant:
- Master process = Restaurant manager (oversees everything)
- Worker processes = Waiters (serve customers directly)

Each worker process can handle thousands of connections simultaneously using an efficient event-driven model, making Nginx extremely performant.

## Key Worker-Related Settings

### 1. worker_processes
Defines how many worker processes Nginx will spawn.

```nginx
worker_processes auto;  # Automatically detect number of CPU cores
# or
worker_processes 4;     # Manually set to 4 workers
```

### 2. worker_connections
Sets the maximum number of simultaneous connections each worker can handle.

```nginx
events {
    worker_connections 1024;  # Each worker handles up to 1024 connections
}
```

### 3. worker_rlimit_nofile
Sets the maximum number of open files (including connections) for worker processes.

```nginx
worker_rlimit_nofile 65535;  # Increase file descriptor limit
```

### Relationship Between These Settings

The total number of connections Nginx can handle is:
```
max_clients = worker_processes * worker_connections
```

However, each connection requires file descriptors:
- 1 for the client connection
- 1 for the upstream connection (if proxying)
- Additional for log files, static files, etc.

Therefore: `worker_rlimit_nofile` should be at least `2 * worker_connections`

## Recommended Values and Best Practices

**Important Note**:
Follows are reference configurations. Always test thoroughly on your staging server before applying to production. Actual values depend on:
- Hardware specifications (CPUs, RAM)
- Application characteristics (response time, payload size)
- Network conditions
- Operating system limits
- Upstream server capacity

Monitor your metrics and adjust accordingly. Start conservative and scale up based on real performance data.

### Configuration Matrix by Traffic Level

| Traffic Level | RPS (Requests/Second) | worker_processes | worker_connections | worker_rlimit_nofile |
|--------------|----------------------|------------------|-------------------|---------------------|
| **Low**      | < 1,000 RPS         | auto (or 2-4)    | 1024              | 8192                |
| **Medium**   | 1,000 - 10,000 RPS  | auto (or 4-8)    | 2048              | 32768               |
| **High**     | > 10,000 RPS        | auto (or 8-16)   | 4096              | 65535               |

in other words

- **worker_processes**: Number of CPU cores (use `auto` for automatic detection)
- **worker_connections**: Based on expected concurrent connections
- **worker_rlimit_nofile**: At least `2 * worker_connections + 1000` (for overhead)

## Common Practice

1. **Setting worker_processes too high**: More workers than CPU cores can cause context switching overhead
   - Each CPU core can only execute one process at a time.
   - When you have more worker processes than CPU cores, the operating system must constantly switch between processes (context switching).
   - This switching takes CPU time away from actually serving requests, reducing overall performance instead of improving it.

2. **Forgetting system limits**: Always check and adjust OS limits (ex. `/etc/security/limits.conf` on Linux)
   - Even if Nginx is configured to handle many connections, the operating system has its own limits on file descriptors (each connection uses a file descriptor).
   - If OS limits are lower than Nginx settings, workers will fail with "Too many open files" errors, causing connection drops and service disruptions.

3. **Not monitoring**: Use tools like `nginx status` module to monitor active connections
