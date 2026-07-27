"use client";
import Link from "next/link";

type Event = { id: string; caseId: string; date: string; label: string; completed: boolean };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CalendarView({ year, month, events }: { year: number; month: number; events: Event[] }) {
  const byDay = new Map<string, Event[]>();
  for (const ev of events) {
    const list = byDay.get(ev.date) || [];
    list.push(ev);
    byDay.set(ev.date, list);
  }

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startWeekday = firstOfMonth.getUTCDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          href={"/dashboard/calendar?month=" + prevMonth.y + "-" + pad(prevMonth.m)}
          className="px-3 py-1.5 text-sm rounded-md border border-slate-300 hover:bg-slate-100"
        >
          ← Prev
        </Link>
        <div className="font-semibold text-slate-900">
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <Link
          href={"/dashboard/calendar?month=" + nextMonth.y + "-" + pad(nextMonth.m)}
          className="px-3 py-1.5 text-sm rounded-md border border-slate-300 hover:bg-slate-100"
        >
          Next →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs font-semibold text-slate-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-slate-50 px-2 py-1.5 text-center">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200 border-x border-b border-slate-200 rounded-b-lg overflow-hidden">
        {cells.map((day, i) => {
          const dateStr = day ? year + "-" + pad(month) + "-" + pad(day) : null;
          const dayEvents = dateStr ? byDay.get(dateStr) || [] : [];
          const isToday = dateStr === todayStr;
          return (
            <div key={i} className={"bg-white min-h-[6.5rem] p-1.5 " + (!day ? "bg-slate-50" : "")}>
              {day && (
                <>
                  <div className={"text-xs font-medium mb-1 " + (isToday ? "inline-flex w-5 h-5 items-center justify-center rounded-full bg-indigo-600 text-white" : "text-slate-700")}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <Link
                        key={ev.id}
                        href={"/dashboard/cases/" + ev.caseId}
                        className={"block text-[10px] leading-tight px-1 py-0.5 rounded truncate " + (ev.completed ? "bg-slate-100 text-slate-400 line-through" : "bg-indigo-50 text-indigo-800")}
                        title={ev.label}
                      >
                        {ev.label}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
