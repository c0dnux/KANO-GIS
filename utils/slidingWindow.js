const AppError = require("./appError");

const clients = new Map();

function slidingWindow(options) {
  const { windowMs, max, message } = options;

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of clients) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        clients.delete(key);
      } else {
        clients.set(key, valid);
      }
    }
  }, windowMs);

  if (cleanup.unref) {
    cleanup.unref();
  }

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!clients.has(key)) {
      clients.set(key, []);
    }

    const timestamps = clients.get(key);
    const windowStart = now - windowMs;
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= max) {
      const oldest = validTimestamps[0];
      const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", Math.ceil((oldest + windowMs) / 1000));
      return next(new AppError(message || "Too many requests", 429));
    }

    validTimestamps.push(now);
    clients.set(key, validTimestamps);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - validTimestamps.length);
    res.setHeader("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000));

    next();
  };
}

module.exports = slidingWindow;
