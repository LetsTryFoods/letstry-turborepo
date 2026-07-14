import client from 'prom-client';

export const register = new client.Registry();

// Enable default Node.js metrics
client.collectDefaultMetrics({ register });

// Define custom Next.js metrics
export const httpDuration = new client.Histogram({
  name: 'nextjs_http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['route', 'method', 'status'],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000],
});

export const cacheStatus = new client.Counter({
  name: 'nextjs_cache_status_total',
  help: 'Cache HIT/MISS count',
  labelNames: ['route', 'status'], // status: HIT / MISS
});

export const responseSize = new client.Histogram({
  name: 'nextjs_response_size_bytes',
  help: 'Response size in bytes',
  labelNames: ['route'],
  buckets: [1000, 10000, 100000, 500000, 1000000],
});

register.registerMetric(httpDuration);
register.registerMetric(cacheStatus);
register.registerMetric(responseSize);
