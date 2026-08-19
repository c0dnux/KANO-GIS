const redis = require("./redis");

const DEFAULT_TTL = 300;

function cacheMiddleware(keyPrefix, ttlSeconds = DEFAULT_TTL, opts = {}) {
  return async (req, res, next) => {
    const userPart = opts.perUser && req.user?.id ? `:${req.user.id}` : "";
    const cacheKey = `${keyPrefix}${userPart}:${req.originalUrl}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        res.set("Cache-Control", `public, max-age=${ttlSeconds}`);
        return res.status(200).json(data);
      }
    } catch {
      // Redis unavailable, continue without cache
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redis.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch(() => {});
      return originalJson(body);
    };

    next();
  };
}

function viewCacheMiddleware(keyPrefix, ttlSeconds = DEFAULT_TTL, opts = {}) {
  return async (req, res, next) => {
    const userPart = opts.perUser && req.user?.id ? `:${req.user.id}` : "";
    const cacheKey = `${keyPrefix}${userPart}:${req.originalUrl}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.set("Cache-Control", `public, max-age=${ttlSeconds}`);
        return res.send(cached);
      }
    } catch {
      // Redis unavailable, continue without cache
    }

    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (typeof body === "string") {
        redis.setex(cacheKey, ttlSeconds, body).catch(() => {});
      }
      return originalSend(body);
    };

    next();
  };
}

async function invalidateCache(pattern) {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch {
    // Redis unavailable, skip invalidation
  }
}

async function cacheGet(key) {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = DEFAULT_TTL) {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Redis unavailable
  }
}

module.exports = {
  cacheMiddleware,
  viewCacheMiddleware,
  invalidateCache,
  cacheGet,
  cacheSet,
};
