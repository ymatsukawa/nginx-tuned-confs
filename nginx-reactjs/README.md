# nginx reactjs

Configurations are almost same to [nginx-json's settings](../nginx-json).

## Topic differences

### [basic/gzip.conf](./basic/gzip.conf)

Added mimetype for browser rendering.

### [advanced/cache.conf](./advanced/cache.conf)

This configuration enables nginx's open file cache to improve performance by caching file metadata.

**`open_file_cache max=2000 inactive=20s`**

Caches file descriptors, file headers, and directory existence information for up to 2000 files. Files not accessed within 20 seconds are removed from the cache.
This reduces filesystem operations and improves response times for frequently accessed static assets.

**`open_file_cache_valid 30s`**

Sets how long cached file information remains valid without re-checking the filesystem.
After 30 seconds, nginx will verify if the cached file still exists and hasn't been modified.
This balances performance with freshness of content.

**`open_file_cache_min_uses 2`**

Sets the minimum number of times a file must be accessed during the inactive period to stay in the cache.
Files accessed fewer than 2 times within 20 seconds are removed from the cache.
This prevents rarely accessed files from consuming cache space.

**`open_file_cache_errors on`**

Caches file lookup errors (such as "file not found").
This prevents repeated filesystem lookups for missing files, reducing load when clients request non-existent resources.

**Setting Standard of Caches**

**Important Note**:
The following are reference configurations for common scenarios.
Always test thoroughly in your staging environment with realistic loads.
Adjust based on your specific static file patterns, RPS, CPU cores, and available memory.

| Site Size | RPS | CPU Cores | Memory | open_file_cache - max | open_file_cache - inactive | open_file_cache_valid | open_file_cache_min_uses |
|-----------|-----|-----------|---------|---------------------|--------------------------|----------------------|--------------------------|
| Small | < 1,000 | 2-4 | 2-4GB | 1000 | 20s | 30s | 2 |
| Medium | 1,000-5,000 | 4-8 | 8-16GB | 4000 | 30s | 60s | 3 |
| Large | > 5,000 | 8+ | 16GB+ | 10000 | 60s | 120s | 5 |

**Configuration example** (Medium site):
```
open_file_cache max=4000 inactive=30s;
open_file_cache_valid 60s;
open_file_cache_min_uses 3;
open_file_cache_errors on;
```

**Notes**:

**Calculating cache size**:
- The `max` parameter depends on: number of files × traffic volume
- Formula: `max` = (Total unique files * 1.2) + (Requests per second * Files per request * 2)
- Example: 500 files + 1000 RPS * 3 files/request = 600 + 6000 = 6600 max entries

**How each directive relates to your system**:
- `max`: Increase when you have more static files or higher traffic
- `inactive`: Increase for rarely-changing files (images, CSS), decrease for frequently-updated content
- `valid`: Increase when files change infrequently to reduce filesystem checks
- `min_uses`: Increase to save cache space by excluding rarely-accessed files

**Resource consumption**:
- Each cache entry consumes approximately 0.5-1KB of memory
- 4000 entries = ~4MB RAM, 10000 entries = ~10MB RAM

**Performance monitoring**:
- Use nginx stub_status module to check cache hit rates
- If "open" operations are high, increase `max` value
- If memory is limited, increase `min_uses` or decrease `inactive`

### [security](./security/)

Security configurations are split into separate files for modularity:

#### security/basic_auth.conf (commented out by default)

Provides HTTP Basic Authentication for access control:

**`auth_basic`**

Enables HTTP basic authentication with a realm name (displayed in browser authentication prompts).
When enabled, users must provide valid credentials to access protected resources.

**`auth_basic_user_file`**

Specifies the location of the password file containing username:password pairs.
Passwords should be encrypted using tools like htpasswd.

#### security/cors.conf (commented out by default)

Configures Cross-Origin Resource Sharing (CORS) for API access from web browsers:

**`Access-Control-Allow-Origin`**

Specifies which origins can access the resource.
The wildcard "*" allows any origin, but for production, specify exact origins for better security.

**`Access-Control-Allow-Methods`**

Lists the HTTP methods that browsers can use for cross-origin requests.
This should match your API's supported methods.

**`Access-Control-Allow-Headers`**

Specifies which headers can be included in cross-origin requests.
Include any custom headers your API requires.

**`Access-Control-Max-Age`**

Tells browsers how long (in seconds) to cache preflight responses.
86400 (24 hours) reduces preflight requests for better performance.

**OPTIONS method handling**

Returns 204 No Content for preflight requests, allowing browsers to check CORS permissions without processing the full request.

#### security/header.conf

Active security headers that protect against common web vulnerabilities:

**`X-Frame-Options: SAMEORIGIN`**

Prevents clickjacking attacks by allowing the page to be embedded only in frames on the same origin.
This protects users from malicious sites that might embed your content.

**`X-Content-Type-Options: nosniff`**

Prevents browsers from MIME-sniffing responses away from the declared Content-Type.
This stops browsers from incorrectly executing malicious files as scripts.

**`X-XSS-Protection: 1; mode=block`**

Enables the browser's built-in XSS filter (for older browsers).
When XSS is detected, the browser blocks the page rather than sanitizing it.

**`Referrer-Policy: no-referrer-when-downgrade`**

Controls how much referrer information is sent with requests.
This policy sends the full URL as referrer except when navigating from HTTPS to HTTP.

**`X-Permitted-Cross-Domain-Policies: none`**

Prevents Adobe Flash and PDF documents from loading data from your domain.
This header is a defense-in-depth measure against cross-domain data theft.
