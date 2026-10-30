/**
 * VIP Subscription Validity Helper
 * Handles 1-month (30 days) and 1-year (365 days) subscription calculations.
 */

export function calculateVipExpiry(plan: '1month' | '1year' | string, existingExpiresAt?: string) {
  const now = Date.now();
  let baseTime = now;

  // If the user already has an active unexpired plan, we can extend it from current expiry
  if (existingExpiresAt) {
    const existingTime = new Date(existingExpiresAt).getTime();
    if (existingTime > now) {
      baseTime = existingTime;
    }
  }

  const durationDays = plan === '1month' ? 30 : 365;
  const expiryTime = baseTime + durationDays * 24 * 60 * 60 * 1000;

  return {
    validFrom: new Date().toISOString(),
    expiresAt: new Date(expiryTime).toISOString(),
    durationDays,
    planDurationText: plan === '1month' ? '1 माह (30 दिन)' : '1 वर्ष (365 दिन)'
  };
}

export function checkVipExpiryStatus(expiresAt?: string | null) {
  if (!expiresAt) {
    return {
      isExpired: false,
      daysRemaining: 999,
      statusText: 'सक्रिय (असीमित)',
      formattedExpiry: 'असीमित'
    };
  }

  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expiryTime - now;

  if (diffMs <= 0) {
    return {
      isExpired: true,
      daysRemaining: 0,
      statusText: 'समाप्त (Expired)',
      formattedExpiry: new Date(expiresAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };
  }

  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    isExpired: false,
    daysRemaining,
    statusText: `${daysRemaining} दिन शेष`,
    formattedExpiry: new Date(expiresAt).toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  };
}
