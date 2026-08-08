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
  windowMs = 60_000,
  consume = true
}) {
  const key = `${subject}:${kind}`;
  const recent = (buckets.get(key) || []).filter((stamp) => now - stamp < windowMs);

  if (recent.length >= maximum) {
    if (consume) buckets.set(key, recent);
    return {
      allowed: false,
      limit: maximum,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000))
    };
  }

  if (consume) {
    recent.push(now);
    buckets.set(key, recent);
  }
  return {
    allowed: true,
    limit: maximum,
    remaining: Math.max(0, maximum - recent.length - (consume ? 0 : 1)),
    retryAfterSeconds: 0
  };
}

export function consumeRateLimitsAtomically(buckets, requests, now = Date.now()) {
  const previews = requests.map((request) => consumeRateLimit(buckets, {
    ...request,
    now,
    consume: false
  }));
  const blockedIndex = previews.findIndex((status) => !status.allowed);

  if (blockedIndex !== -1) {
    return { allowed: false, blockedIndex, statuses: previews };
  }

  return {
    allowed: true,
    blockedIndex: -1,
    statuses: requests.map((request) => consumeRateLimit(buckets, { ...request, now }))
  };
}
