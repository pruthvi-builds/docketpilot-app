import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Server uploads (this route) are capped at 4.5MB by the platform, which is
// plenty for the typical scanned filing, letter, or PDF a solo/small firm
// attaches to a case. Larger files aren't a priority for v1.
const MAX_SIZE_BYTES = 4.5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caseId = req.nextUrl.searchParams.get("caseId");
  const filename = req.nextUrl.searchParams.get("filename");
  if (!caseId || !filename) {
    return NextResponse.json({ error: "caseId and filename are required." }, { status: 400 });
  }

  const owned = await prisma.case.findFirst({ where: { id: caseId, firmId: session.firmId } });
  if (!owned) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large. Max size is 4.5MB." }, { status: 413 });
  }

  const contentType = req.headers.get("content-type") || "application/octet-stream";
  const pathname = "documents/" + caseId + "/" + Date.now() + "-" + filename;

  const blob = await put(pathname, req.body, {
    access: "private",
    contentType,
  });

  const doc = await prisma.document.create({
    data: {
      firmId: session.firmId,
      caseId,
      filename,
      pathname: blob.pathname,
      contentType,
      size: contentLength,
    },
  });

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "document.uploaded", detail: filename },
  });

  return NextResponse.json({
    id: doc.id,
    filename: doc.filename,
    contentType: doc.contentType,
    size: doc.size,
    uploadedAt: doc.uploadedAt.toISOString(),
  });
}
