import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CaseDetail from "./CaseDetail";

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const caseRecord = await prisma.case.findFirst({
    where: { id: params.id, firmId: session!.firmId },
    include: {
      deadlines: { orderBy: { dueDate: "asc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });
  if (!caseRecord) notFound();

  const serializable = {
    id: caseRecord.id,
    clientName: caseRecord.clientName,
    caseNumber: caseRecord.caseNumber,
    court: caseRecord.court,
    caseType: caseRecord.caseType,
    status: caseRecord.status,
    deadlines: caseRecord.deadlines.map((d) => ({
      id: d.id,
      type: d.type,
      dueDate: d.dueDate.toISOString().slice(0, 10),
      notes: d.notes,
      completed: d.completed,
    })),
    documents: caseRecord.documents.map((doc) => ({
      id: doc.id,
      filename: doc.filename,
      size: doc.size,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
  };

  return <CaseDetail initialCase={serializable} />;
}
