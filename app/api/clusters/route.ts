import { NextResponse } from "next/server";
import { getClusters, parseQuery, parseSort, parseWindow } from "@/lib/api";

// Proxy so the client Feed can page without talking to FastAPI directly (no CORS).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const tunisian = searchParams.get("tunisian") === "true";
  const q = parseQuery(searchParams.get("q"));
  const sort = parseSort(searchParams.get("sort"));
  const window = parseWindow(searchParams.get("window"));
  const asOf = searchParams.get("as_of") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    const page = await getClusters({ category, tunisian, q, sort, window, asOf, limit, offset });
    // Forwarded so a client that didn't pin `as_of` can still learn the clock it was served at.
    return NextResponse.json(page.clusters, {
      headers: page.asOf ? { "X-as-of": page.asOf } : undefined,
    });
  } catch {
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }
}
