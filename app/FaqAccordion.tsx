"use client";
import { useState } from "react";

type Faq = { q: string; a: string };

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-slate-900 text-sm">{f.q}</span>
              <span className={`shrink-0 text-indigo-600 text-lg transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            {isOpen && <p className="text-sm text-slate-500 px-5 pb-4 -mt-1">{f.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
