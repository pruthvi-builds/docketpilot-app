import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const firm = await prisma.firm.create({
    data: {
      name: "Alvarez & Partners",
      users: {
        create: [
          { email: "demo@docketpilot.app", name: "Jane Alvarez", role: "ADMIN", passwordHash },
        ],
      },
    },
  });

  const cases = [
    {
      clientName: "Maria Alvarez",
      caseNumber: "2026-CV-1042",
      court: "King County Superior Court",
      caseType: "Civil",
      deadlines: [
        { type: "Filing Deadline", dueDate: addDays(-2), notes: "Motion for summary judgment" },
      ],
    },
    {
      clientName: "Tom Whitfield",
      caseNumber: "2026-FAM-330",
      court: "Family Court Div. 3",
      caseType: "Family",
      deadlines: [{ type: "Hearing Date", dueDate: addDays(3), notes: "Custody hearing" }],
    },
    {
      clientName: "Nguyen Estate",
      caseNumber: "2025-PR-118",
      court: "Probate Court",
      caseType: "Probate",
      deadlines: [{ type: "Statute of Limitations", dueDate: addDays(14), notes: "Creditor claim deadline" }],
    },
    {
      clientName: "Riverside LLC",
      caseNumber: "2026-CV-2071",
      court: "District Court",
      caseType: "Civil",
      deadlines: [{ type: "Discovery Cutoff", dueDate: addDays(45), notes: "" }],
    },
  ];

  for (const c of cases) {
    await prisma.case.create({
      data: {
        firmId: firm.id,
        clientName: c.clientName,
        caseNumber: c.caseNumber,
        court: c.court,
        caseType: c.caseType,
        deadlines: { create: c.deadlines },
      },
    });
  }

  console.log("Seeded firm 'Alvarez & Partners'.");
  console.log("Login: demo@docketpilot.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
