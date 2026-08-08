export function boundedIntegerSetting(value, fallback, { minimum = 1, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(parsed)));
}

export function consumeRateLimit(buckets, {
  subject,
  kind,
  maximum,
  now = Date.now(),
  windowMs = 60_000
}) {
  const key = `${subject}:${kind}`;
  const recent = (buckets.get(key) || []).filter((stamp) => now - stamp < windowMs);

  if (recent.length >= maximum) {
    buckets.set(key, recent);
    return {
      allowed: false,
      limit: maximum,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000))
    };
  }

  recent.push(now);
  buckets.set(key, recent);
  return {
    allowed: true,
    limit: maximum,
    remaining: Math.max(0, maximum - recent.length),
    retryAfterSeconds: 0
  };
}
