import { redirect } from "next/navigation";

// The orders dashboard lives at /admin; this keeps old links and bookmarks working.
export default async function AdminOrdersRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) if (value) params.set(key, value);
  redirect(params.size ? `/admin?${params.toString()}` : "/admin");
}
