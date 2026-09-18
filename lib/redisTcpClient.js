import { createClient } from 'redis';

// lib/tokens.js's getRedis() historically only spoke Upstash's HTTP REST
// protocol (@upstash/redis) — this project's actual provisioned database
// turned out to be Redis Cloud (Vercel's native "Redis" Marketplace
// product, hostname *.db.redis.io), which only exposes a plain
// `redis://...` TCP connection string, no REST API at all. Confirmed
// directly from the value shown in the Vercel dashboard, not guessed.
// @upstash/redis cannot use a `redis://` URL under any configuration, so
// this is a second, TCP-backed client — used ONLY when no REST
// credentials are configured (see getRedis()/getTcpRedisUrl() in
// lib/tokens.js, which resolve the actual env var name — Vercel prefixes
// it with the connected database's own name, so it's never just a bare
// REDIS_URL) — that mimics the exact subset of the @upstash/redis API
// this codebase already calls, so none of those call sites needed to
// change.
//
// Connection reuse: node-redis needs an explicit connect() and a live
// socket, unlike the stateless REST client. Cached at module scope so
// every call within the same warm serverless instance reuses one
// connection instead of reconnecting per request — reconnecting per
// request would be slow and could exhaust the database's connection
// limit under load.
let clientPromise = null;

// A genuinely unreachable Redis must fail FAST, not hang the request —
// every caller in lib/tokens.js already fails closed/non-fatal on a
// rejected promise (see e.g. checkDeviceAgainstBlocklist's try/catch), the
// same contract @upstash/redis's REST client has (a fetch() that just
// errors, no reconnect loop to bound). node-redis's default
// reconnectStrategy retries with backoff FOREVER, which would leave
// connect() pending indefinitely and hang whichever request triggered it —
// capped here at 3 attempts (~1.5s of backoff) so it behaves the same way:
// reject promptly instead of retrying past the request's own lifetime.
// MAX_CONNECT_MS is a second, independent hard deadline on top of that, in
// case a single attempt's own connectTimeout is somehow not honored.
const MAX_CONNECT_MS = 8000;

function getClient(url) {
  if (!clientPromise) {
    const client = createClient({
      url,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => (retries >= 3 ? false : Math.min(retries * 200, 1000)),
      },
    });
    // node-redis throws if an 'error' event has no listener — a dropped
    // connection must not crash the whole function.
    client.on('error', (err) => console.error('[redisTcpClient] connection error:', err.message));

    const connectWithDeadline = Promise.race([
      client.connect().then(() => client),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connect timed out')), MAX_CONNECT_MS)),
    ]);

    clientPromise = connectWithDeadline.catch((err) => {
      clientPromise = null; // let the next call retry instead of caching a failed connection forever
      throw err;
    });
  }
  return clientPromise;
}

// Translates the handful of Upstash-style option/argument shapes this
// codebase actually uses into node-redis v6's shapes. Anything not listed
// here isn't called anywhere in this project.
export function getTcpRedisAdapter(url) {
  return {
    async get(key) {
      const client = await getClient(url);
      return client.get(key);
    },
    async set(key, value, opts) {
      const client = await getClient(url);
      const options = opts?.ex != null ? { EX: opts.ex } : undefined;
      return client.set(key, value, options);
    },
    async del(...keys) {
      const client = await getClient(url);
      return client.del(keys);
    },
    async exists(key) {
      const client = await getClient(url);
      return client.exists(key);
    },
    async expire(key, seconds) {
      const client = await getClient(url);
      return client.expire(key, seconds);
    },
    async incr(key) {
      const client = await getClient(url);
      return client.incr(key);
    },
    async lpush(key, value) {
      const client = await getClient(url);
      return client.lPush(key, value);
    },
    async ltrim(key, start, stop) {
      const client = await getClient(url);
      return client.lTrim(key, start, stop);
    },
    async lrange(key, start, stop) {
      const client = await getClient(url);
      return client.lRange(key, start, stop);
    },
    async sadd(key, ...members) {
      const client = await getClient(url);
      return client.sAdd(key, members);
    },
    async smembers(key) {
      const client = await getClient(url);
      return client.sMembers(key);
    },
    async srem(key, member) {
      const client = await getClient(url);
      return client.sRem(key, member);
    },
    async sismember(key, member) {
      const client = await getClient(url);
      return client.sIsMember(key, member);
    },
    async hget(key, field) {
      const client = await getClient(url);
      return client.hGet(key, field);
    },
    async hgetall(key) {
      const client = await getClient(url);
      return client.hGetAll(key);
    },
    async hset(key, fieldValues) {
      const client = await getClient(url);
      return client.hSet(key, fieldValues);
    },
    async hdel(key, ...fields) {
      const client = await getClient(url);
      return client.hDel(key, fields);
    },
    async hexpire(key, field, seconds) {
      const client = await getClient(url);
      return client.hExpire(key, field, seconds);
    },
    async zadd(key, { score, member }) {
      const client = await getClient(url);
      return client.zAdd(key, { score, value: member });
    },
    async zrange(key, start, stop) {
      const client = await getClient(url);
      return client.zRange(key, start, stop);
    },
    async zremrangebyscore(key, min, max) {
      const client = await getClient(url);
      return client.zRemRangeByScore(key, min, max);
    },
  };
}
