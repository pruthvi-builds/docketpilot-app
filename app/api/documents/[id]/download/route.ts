import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Auth-gate the file the same way as everything else: it must belong to
  // this firm. This is what keeps a "private" Blob actually private, since
  // the blob store's own token is never exposed to the browser.
  const doc = await prisma.document.findFirst({ where: { id: params.id, firmId: session.firmId } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await get(doc.pathname, { access: "private" });
  if (!result) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(result.stream, {
    headers: {
      "Cache-Control": "private, no-cache",
      "Content-Type": doc.contentType || "application/octet-stream",
      "Content-Disposition": "attachment; filename=\"" + doc.filename + "\"",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
