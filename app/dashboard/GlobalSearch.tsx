"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchResults = {
  cases: { id: string; label: string; sub: string; status: string }[];
  deadlines: { id: string; caseId: string; label: string; sub: string }[];
  tasks: { id: string; caseId: string | null; label: string; sub: string }[];
};

const EMPTY: SearchResults = { cases: [], deadlines: [], tasks: [] };

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults(EMPTY);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch("/api/search?q=" + encodeURIComponent(query.trim()));
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const hasResults = results.cases.length + results.deadlines.length + results.tasks.length > 0;

  function goTo(path: string) {
    setOpen(false);
    setQuery("");
    router.push(path);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search cases, deadlines, tasks..."
        className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-md px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute mt-1 w-full min-w-[20rem] bg-white border border-slate-200 rounded-md shadow-xl z-50 max-h-96 overflow-y-auto text-slate-900">
          {loading && <div className="px-3 py-3 text-sm text-slate-400">Searching...</div>}
          {!loading && !hasResults && <div className="px-3 py-3 text-sm text-slate-400">No matches.</div>}
          {!loading && results.cases.length > 0 && (
            <Section title="Cases">
              {results.cases.map((c) => (
                <Row key={c.id} label={c.label} sub={c.sub} onClick={() => goTo("/dashboard/cases/" + c.id)} />
              ))}
            </Section>
          )}
          {!loading && results.deadlines.length > 0 && (
            <Section title="Deadlines">
              {results.deadlines.map((d) => (
                <Row key={d.id} label={d.label} sub={d.sub} onClick={() => goTo("/dashboard/cases/" + d.caseId)} />
              ))}
            </Section>
          )}
          {!loading && results.tasks.length > 0 && (
            <Section title="Tasks">
              {results.tasks.map((t) => (
                <Row key={t.id} label={t.label} sub={t.sub} onClick={() => goTo(t.caseId ? "/dashboard/cases/" + t.caseId : "/dashboard/tasks")} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2 hover:bg-slate-50 border-t border-slate-50 first:border-t-0">
      <div className="text-sm font-medium text-slate-900">{label}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </button>
  );
}
