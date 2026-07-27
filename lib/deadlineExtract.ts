// Lightweight, dependency-free heuristic for pulling candidate deadlines out of
// pasted text (an order, notice, or scheduling letter). This is intentionally
// NOT an AI/PDF pipeline — it's a regex-based date scanner with keyword-based
// type guessing, so it has no new dependencies and no external API calls.
// Users paste text (copied from a PDF/Word doc/email) and review every
// suggestion before anything is saved — nothing is auto-added.

export type ExtractedDeadline = {
  key: string;
  rawMatch: string;
  dueDate: string; // ISO yyyy-mm-dd
  typeGuess: string;
  context: string; // surrounding text for the user to verify against
};

const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const TYPE_KEYWORDS: { type: string; keywords: string[] }[] = [
  { type: "Hearing Date", keywords: ["hearing", "trial", "conference", "oral argument"] },
  { type: "Statute of Limitations", keywords: ["statute of limitations", "limitations period", "sol deadline"] },
  {
    type: "Discovery Cutoff",
    keywords: ["discovery", "interrogator", "request for production", "deposition", "produce documents"],
  },
  {
    type: "Filing Deadline",
    keywords: ["answer", "response due", "respond", "file", "filing", "motion", "brief due", "opposition due"],
  },
];

function isValidDate(y: number, m: number, d: number) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function toISO(y: number, m: number, d: number) {
  const yyyy = String(y).padStart(4, "0");
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function guessType(context: string): string {
  const lower = context.toLowerCase();
  for (const { type, keywords } of TYPE_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return type;
  }
  return "Other";
}

function contextAround(text: string, index: number, len: number, radius = 70): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + len + radius);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

// Like contextAround, but clipped to the sentence(s) actually containing the
// match, so type-guessing doesn't bleed keywords in from an adjacent sentence
// about a different date. Falls back to a wider window if no clear sentence
// boundary is found nearby.
function sentenceAround(text: string, index: number, len: number): string {
  const windowStart = Math.max(0, index - 220);
  const windowEnd = Math.min(text.length, index + len + 220);
  const window = text.slice(windowStart, windowEnd);
  const localIndex = index - windowStart;

  const boundary = /[.!?\n]/g;
  let start = 0;
  let match: RegExpExecArray | null;
  while ((match = boundary.exec(window)) !== null) {
    if (match.index < localIndex) start = match.index + 1;
    else break;
  }
  boundary.lastIndex = localIndex + len;
  let end = window.length;
  const after = boundary.exec(window);
  if (after && after.index >= localIndex) end = after.index + 1;

  const sentence = window.slice(start, end).replace(/\s+/g, " ").trim();
  return sentence.length > 15 ? sentence : contextAround(text, index, len);
}

const MONTH_NAMES = Object.keys(MONTHS).join("|");

const PATTERNS: { regex: RegExp; toDate: (m: RegExpMatchArray) => { y: number; m: number; d: number } | null }[] = [
  {
    // ISO: 2026-07-28
    regex: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g,
    toDate: (m) => ({ y: +m[1], m: +m[2], d: +m[3] }),
  },
  {
    // US slash: 7/28/2026 or 07/28/26
    regex: /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g,
    toDate: (m) => {
      let y = +m[3];
      if (y < 100) y += 2000;
      return { y, m: +m[1], d: +m[2] };
    },
  },
  {
    // Month Day, Year: July 28, 2026 / Jul. 28 2026
    regex: new RegExp(`\\b(${MONTH_NAMES})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, "gi"),
    toDate: (m) => {
      const mon = MONTHS[m[1].toLowerCase()];
      if (!mon) return null;
      return { y: +m[3], m: mon, d: +m[2] };
    },
  },
  {
    // Day Month Year: 28 July 2026
    regex: new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_NAMES})\\.?,?\\s+(\\d{4})\\b`, "gi"),
    toDate: (m) => {
      const mon = MONTHS[m[2].toLowerCase()];
      if (!mon) return null;
      return { y: +m[3], m: mon, d: +m[1] };
    },
  },
];

export function extractDeadlines(text: string): ExtractedDeadline[] {
  const seen = new Map<string, ExtractedDeadline>();

  for (const { regex, toDate } of PATTERNS) {
    let match: RegExpExecArray | null;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(text)) !== null) {
      const parsed = toDate(match);
      if (!parsed) continue;
      const { y, m, d } = parsed;
      if (!isValidDate(y, m, d)) continue;
      // Ignore obviously-out-of-range years (likely case numbers, phone numbers, etc.)
      if (y < 2000 || y > 2100) continue;

      const iso = toISO(y, m, d);
      const context = contextAround(text, match.index ?? 0, match[0].length);
      const sentence = sentenceAround(text, match.index ?? 0, match[0].length);

      // De-dupe on exact same date so the same date matched twice by two
      // different patterns doesn't produce duplicate candidates.
      const dupKey = `date_${iso}`;
      if (seen.has(dupKey)) continue;

      const candidate: ExtractedDeadline = {
        key: `extract_${iso}_${seen.size}`,
        rawMatch: match[0],
        dueDate: iso,
        typeGuess: guessType(sentence),
        context,
      };
      seen.set(dupKey, candidate);
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
