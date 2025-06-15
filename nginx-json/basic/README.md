# Basic configurations

This directory contains fundamental nginx configurations for JSON API performance tuning.
Each configuration file focuses on a specific aspect of optimization.

## transfer.conf

HTTP network performance tuning for efficient data transfer.

**`sendfile on`**

Uses the kernel's sendfile() system call to transfer files directly from disk to network socket.
This bypasses the application buffer in user space, reducing CPU usage and memory copies.
Essential for serving static files efficiently.

**`tcp_nopush on`**

Sends HTTP response headers and file content together in a single TCP packet instead of separate packets.
This reduces network overhead and improves performance by minimizing the number of network round trips required.

**`tcp_nodelay on`** (commented out because it's nginx default)

Disables Nagle's algorithm to send small packets immediately without waiting to accumulate more data.
Important for interactive applications and APIs where low latency is more important than bandwidth efficiency.

## client_timeout.conf

Client connection timeout settings to manage resource usage and connection lifecycle.

**`keepalive_timeout 30s`**

Sets how long nginx keeps idle client connections open for reuse.
30 seconds balances connection reuse benefits with memory usage.
Shorter timeouts free resources faster but require more new connections.

**`keepalive_requests 500`**

Maximum number of requests that can be served through one keep-alive connection.
Higher values reduce connection overhead for busy clients but use more memory per connection.

**`reset_timedout_connection on`**

Immediately closes timed-out connections and frees associated memory.
This prevents accumulation of dead connections and helps maintain server performance under load.

## proxy_timeout.conf

Timeout settings for communication with backend servers to prevent hanging connections.

**`proxy_connect_timeout 10s`**

Maximum time nginx waits to establish a connection to the backend server.
Short timeouts prevent slow backends from blocking nginx workers.

**`proxy_send_timeout 10s`**

Maximum time for sending a request to the backend.
Protects against slow or unresponsive backend servers that can't receive data quickly.

**`proxy_read_timeout 10s`**

Maximum time to receive a response from the backend.
Prevents nginx from waiting indefinitely for backend responses and keeps connections available for other requests.

## gzip.conf

Response compression settings to reduce bandwidth usage and improve client loading times.

**`gzip on`** with **`gzip_comp_level 6`**

Enables gzip compression at level 6 (balanced compression ratio vs CPU usage).
Reduces JSON response sizes significantly while maintaining reasonable server performance.

**`gzip_min_length 1000`**

Only compresses responses larger than 1000 bytes.
Small responses have compression overhead that outweighs benefits, so this prevents unnecessary CPU usage.

**`gzip_vary on`**

Adds "Vary: Accept-Encoding" header to responses.
This tells caches and CDNs to store separate versions for compressed and uncompressed content,
preventing serving compressed content to clients that don't support it.

**`gzip_types`**

Specifies MIME types to compress.
Focuses on JSON formats (`application/json`, `application/ld+json`, etc.) since this is a JSON API server configuration.

## log_format.conf

Structured logging formats for monitoring and debugging API performance.

**`json_combined` format**

Creates JSON-structured access logs with key metrics like request time, response size, upstream response time, and gzip compression ratio.
JSON format enables easy parsing by log analysis tools.

**`security_json` format**

Specialized logging format for security events, capturing rate limiting status, HTTP status codes indicating errors (4xx/5xx), and client information for security monitoring.

## ratelimit_zone.conf

Rate limiting zone definition to protect the API from abuse and ensure fair resource usage.

**`limit_req_zone $binary_remote_addr zone=api_rate_limit:10m rate=20r/s`**

Creates a shared memory zone (10MB) that tracks request rates per client IP address.
Limits each IP to 20 requests per second, preventing API abuse while allowing normal usage patterns.
