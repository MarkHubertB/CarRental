/**
 * Simple in-memory rate limiter to prevent API spamming.
 * In a production environment with multiple server instances, 
 * this should be replaced with a Redis-based limiter (e.g., Upstash).
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // Max 5 requests per minute per IP

const requests = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];
  
  // Filter out requests outside the current window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < WINDOW_MS);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return true;
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);
  return false;
}

export function getRateLimitReset(): number {
  return WINDOW_MS;
}
