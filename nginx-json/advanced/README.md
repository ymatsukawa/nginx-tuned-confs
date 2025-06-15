# Advanced configurations

This directory contains advanced nginx configurations for JSON API performance tuning.

## client_buffers.conf

**`client_body_buffer_size`**

Sets the buffer size for reading client request body.
When a JSON payload fits in this buffer, nginx processes it in memory without writing to disk.
For JSON APIs, set this larger than your typical request payload size to avoid disk I/O.

**`client_max_body_size`**

Sets the maximum allowed size of the client request body (the entire JSON payload sent by the client).
If a client sends a larger payload, nginx returns 413 (Request Entity Too Large) error.

**`client_header_buffer_size`**

Sets the buffer size for reading client request headers (like Content-Type, Authorization, etc).
Most JSON API headers fit in 1k, but increase if using large JWT tokens or custom headers.

**`large_client_header_buffers`**

Sets the maximum number and size of buffers for large client request headers.
Used when headers exceed client_header_buffer_size. Format: `number size`.

**`client_body_timeout`**

Sets timeout for reading client request body between two successive read operations.
If client doesn't send data within this time, nginx closes the connection with 408 error.

**`client_header_timeout`**

Sets timeout for reading client request headers. If client doesn't send complete headers in time, connection closes.
Helps protect against slowloris attacks where clients send headers very slowly.

**`send_timeout`**

Sets timeout for sending a response to the client between two successive write operations.
If client doesn't read data within this time (slow network/client), nginx closes connection.

## proxy_buffers.conf

**`proxy_buffering`**

Enables or disables buffering of responses from the proxied server (your JSON API backend).
When on, nginx reads the entire response before sending to client. When off, response is passed immediately.

**`proxy_buffer_size`**

Sets the buffer size for reading the first part of the response from proxied server (usually headers).
Must be large enough to fit response headers plus beginning of JSON response.

**`proxy_buffers`**

Sets the number and size of buffers for reading response from proxied server. Format: `number size`.
Total buffer space = number * size. This should accommodate your typical JSON response size.

**`proxy_busy_buffers_size`**

Sets the size of buffers that can be busy sending response to client while response is not fully read.
Usually set to 2-3 times proxy_buffer_size to allow smooth data flow.

**`proxy_temp_file_write_size`**

Sets the size of data written to temporary file at a time when response doesn't fit in buffers.
Larger values reduce disk I/O operations but use more memory during writes.

**`proxy_max_temp_file_size`**

Sets maximum size of temporary file for storing large responses that don't fit in buffers.
When exceeded, nginx returns error to client. Set to 0 to disable temporary files.

**`proxy_connect_timeout`**

Sets timeout for establishing connection to proxied server (your backend API).
Keep this low to quickly detect backend issues and try next upstream server.

**`proxy_send_timeout`**

Sets timeout for sending a request to the proxied server between two write operations.
If backend doesn't accept data in time, nginx closes connection and may try next server.

**`proxy_read_timeout`**

Sets timeout for reading response from proxied server between two read operations.
Critical for JSON APIs - set based on your slowest expected API endpoint response time.


### Guide of Size Combinations

**Important Note**:
Follows are reference configurations for common scenarios.
Always test thoroughly in your staging environment with realistic loads.
And adjust based on your specific JSON payload sizes and traffic patterns.

The following table shows scenario-based buffer configurations based on two key factors:
- **JSON Response Size**: The typical size of your API responses
- **Request Load**: The number of requests per second (RPS) your server handles

| JSON Size * Load | Low Load<br /> (< 100 RPS) | Medium Load<br /> (100-1000 RPS) | High Load<br /> (> 1000 RPS) |
|-----------------|---------------------|---------------------------|----------------------|
| **Small Size** (< 4KB) | (A) | (B) | (C) |
| **Medium Size** (4-32KB) | (D) | (E) | (F) |
| **Large Size** (32-128KB) | (G) | (H) | (I) |
| **Very Large Size** (128KB-1MB) | (J) | (K) | (L) |

| Config | proxy_buffer_size | proxy_buffers | proxy_busy_buffers_size | Total Buffer Space |
|--------|-------------------|---------------|-------------------------|-------------------|
| (A) | 4k | 4 4k | 8k | 16KB |
| (B) | 4k | 8 4k | 8k | 32KB |
| (C) | 8k | 16 4k | 16k | 64KB |
| (D) | 8k | 4 8k | 16k | 32KB |
| (E) | 8k | 8 8k | 16k | 64KB |
| (F) | 16k | 16 8k | 32k | 128KB |
| (G) | 16k | 8 16k | 32k | 128KB |
| (H) | 16k | 16 16k | 32k | 256KB |
| (I) | 32k | 32 16k | 64k | 512KB |
| (J) | 32k | 16 32k | 64k | 512KB |
| (K) | 32k | 32 32k | 64k | 1MB |
| (L) | 64k | 8 32k | 128k | 256KB + temp files |

### Understanding the Load * Size Matrix

**Why Load Matters for Buffer Configuration:**

1. **Low Load (< 100 RPS)**
   - Fewer concurrent connections mean less memory pressure
   - Can use smaller buffer counts since fewer requests compete for resources
   - Focus on optimal single-request performance

2. **Medium Load (100-1000 RPS)**
   - Balanced approach between memory usage and performance
   - Standard buffer configurations work well
   - Some buffer contention possible, so moderate increases help

3. **High Load (> 1000 RPS)**
   - Many concurrent connections require careful memory management
   - Larger buffer counts help reduce buffer contention
   - May need to optimize differently for very large responses

**How JSON Size Affects Configuration:**

1. **Small JSON (< 4KB) + Load Scenarios**
   - Low Load: Minimal buffers (16KB) since responses fit easily
   - Medium Load: Standard buffers (32KB) handle concurrent small requests
   - High Load: Increased buffers (64KB) prevent buffer starvation

2. **Medium JSON (4-32KB) + Load Scenarios**
   - Low Load: Conservative buffers (32KB) for occasional larger responses
   - Medium Load: Balanced buffers (64KB) for typical API traffic
   - High Load: Generous buffers (128KB) ensure smooth operation

3. **Large JSON (32-128KB) + Load Scenarios**
   - Low Load: Sufficient buffers (128KB) for complete response buffering
   - Medium Load: Larger buffers (256KB) reduce disk I/O
   - High Load: Maximum practical buffers (512KB) with careful tuning

4. **Very Large JSON (128KB-1MB) + Load Scenarios**
   - Low Load: Large buffers (512KB) minimize temp file usage
   - Medium Load: Maximum buffers (1MB) for best performance
   - High Load: Strategic use of temp files to balance memory usage

### Calculating Memory Requirements

To estimate memory usage for your configuration:

```
Total Memory = worker_processes * worker_connections * total_buffer_space * safety_factor

Example for Medium JSON + Medium Load:
- 4 workers * 1024 connections * 64KB buffers * 1.5 safety = ~400MB
```

### When to Adjust These Recommendations

**Increase buffers when:**
- Error logs show "upstream sent too big header"
- Seeing frequent temp file usage in logs
- Response times are inconsistent
- Memory usage is well below available RAM

**Decrease buffers when:**
- Memory usage exceeds 70% of available RAM
- Seeing out-of-memory errors
- Most responses are much smaller than buffer size
- Using caching layers that reduce backend requests

### Additional considerations:

1. **Memory usage** = (worker_processes * worker_connections * total_buffer_space)
   Monitor this to ensure it stays within available system memory

2. **Buffer alignment**: Use powers of 2 (4k, 8k, 16k, 32k) for optimal memory allocation

3. **Response time impact**: Larger buffers can increase time-to-first-byte as nginx waits to fill buffers

4. **Network conditions**: Slower clients benefit from larger proxy_busy_buffers_size

5. **Backend behavior**: If your API streams responses, consider disabling proxy_buffering for those endpoints
