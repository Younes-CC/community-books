import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

// Shared secret between this server and the database. Only the website server knows it, so the
// reservation functions cannot be called directly through the public API.
export function serverToken(): string {
  const token = process.env.RESERVATION_TOKEN;
  if (!token) throw new Error("RESERVATION_TOKEN is not configured");
  return token;
}

// Network address -> short keyed hash that changes every day. The address itself is never stored
// or logged, and the hash cannot be turned back into an address or linked across days.
export async function visitorKey(): Promise<string> {
  const h = await headers();
  const raw =
    h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  // IPv6 users get a new address per device/session: use the /64 network prefix
  const ip = raw.includes(":") ? raw.split(":").slice(0, 4).join(":") : raw;
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", serverToken()).update(`${day}|${ip}`).digest("hex").slice(0, 40);
}
