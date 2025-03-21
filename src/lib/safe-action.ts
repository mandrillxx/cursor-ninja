import { createSafeActionClient } from "next-safe-action";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create a rate limiter - strict limits
const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "2 m"), // 1 request per 2 minutes
  analytics: true,
  prefix: "cursor-ninja-action",
});

// Create base client with error handling
const baseClient = createSafeActionClient({
  handleServerError: (e) => {
    console.error("Action error:", e.message);
    return {
      message: e instanceof Error ? e.message : "An unknown error occurred",
    };
  },
});

// Add rate limiting middleware
export const actionClient = baseClient.use(async ({ next }) => {
  // Get client IP
  const ip =
    process.env.NODE_ENV === "development"
      ? "127.0.0.1"
      : process.env.VERCEL_IP || "127.0.0.1";

  const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

  if (!success) {
    throw new Error(
      `Rate limit exceeded. Try again in ${Math.ceil(
        (reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  console.log(`Rate limit: ${remaining}/${limit} requests remaining`);

  // Continue with the next middleware or execute the action
  return next();
});
