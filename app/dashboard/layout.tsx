import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "./LogoutButton";
import GlobalSearch from "./GlobalSearch";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { firm: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <nav className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-500 flex items-center justify-center font-bold text-sm">
                DP
              </div>
              <span className="font-semibold">DocketPilot</span>
            </Link>
            <div className="hidden sm:flex items-center gap-4 text-sm text-slate-300">
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <Link href="/dashboard/cases" className="hover:text-white">
                Cases
              </Link>
              <Link href="/dashboard/tasks" className="hover:text-white">
                Tasks
              </Link>
              <Link href="/dashboard/calendar" className="hover:text-white">
                Calendar
              </Link>
              <Link href="/dashboard/activity" className="hover:text-white">
                Activity
              </Link>
              <Link href="/dashboard/settings" className="hover:text-white">
                Settings
              </Link>
            </div>
          </div>
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400 hidden lg:inline">
              {user.firm.name} · {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
