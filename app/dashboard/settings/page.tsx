import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SettingsPanel from "./SettingsPanel";

export default async function SettingsPage() {
  const session = await getSession();
  const firm = await prisma.firm.findUnique({
    where: { id: session!.firmId },
    include: { users: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
  });
  if (!firm) return null;

  return (
    <SettingsPanel
      firm={{ id: firm.id, name: firm.name, plan: firm.plan, reminderDaysBefore: firm.reminderDaysBefore }}
      team={firm.users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      isAdmin={session!.role === "ADMIN"}
    />
  );
}
