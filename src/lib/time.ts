// Current time for server-rendered, per-request pages (kept in one place so pages stay free of impure calls).
export const serverNow = () => Date.now();

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// "noch 2 T 5 Std." / "noch 36 Min." / "seit 3 Std. überfällig"
export function formatRemaining(target: string | null, now = Date.now()): { text: string; overdue: boolean } | null {
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  const abs = Math.abs(diff);
  let span: string;
  if (abs >= DAY) span = `${Math.floor(abs / DAY)} T ${Math.floor((abs % DAY) / HOUR)} Std.`;
  else if (abs >= HOUR) span = `${Math.floor(abs / HOUR)} Std. ${Math.floor((abs % HOUR) / 60_000)} Min.`;
  else span = `${Math.max(1, Math.floor(abs / 60_000))} Min.`;
  return diff >= 0 ? { text: `noch ${span}`, overdue: false } : { text: `seit ${span} überfällig`, overdue: true };
}

const TZ = "Europe/Berlin";

function tzOffsetMinutes(ts: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ts));
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(ts / 1000) * 1000) / 60000);
}

// "2026-11-03T14:30" (wall-clock time in Germany) -> ISO instant
export function berlinLocalToIso(local: string): string | null {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const first = guess - tzOffsetMinutes(guess) * 60000;
  const ts = guess - tzOffsetMinutes(first) * 60000;
  return Number.isNaN(ts) ? null : new Date(ts).toISOString();
}

// ISO instant -> value for <input type="datetime-local"> in German wall-clock time
export function isoToBerlinLocal(iso: string | null): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
