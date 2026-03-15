"use client";
import { useGameRegistrations } from "@/hooks/useGameRegistration";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Phone,
  MessageCircle,
  Trophy,
  MapPin,
  Search,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONTACT = {
  name: "Rohan Ponnaiah",
  role: "Tournament Coordinator",
  phone: "+91 8861921427",
  raw: "+91 8861921427",
  whatsapp: "918861921427",
  location: "Kodagu, Karnataka",
};

const GAME_ID = "YOUR_GAME_ID_HERE";

/* ─── helpers ─── */
function TeamAvatar({ name, size = "md" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const sz = size === "lg" ? "w-12 h-12 text-sm" : "w-7 h-7 text-[10px]";
  return (
    <span
      className={`inline-flex items-center justify-center ${sz} rounded-full font-bold text-white shrink-0 select-none`}
      style={{ background: `hsl(${hue},55%,42%)` }}
      title={name}
    >
      {initials}
    </span>
  );
}

function MarqueeTrack({ children }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-stone-50 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-stone-50 to-transparent pointer-events-none" />
      <div className="flex animate-marquee gap-6 w-max">
        {children}
        {children}
      </div>
    </div>
  );
}

/* ─── highlight matched substring ─── */
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 text-amber-900 rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ─── main component ─── */
export default function TournamentContactCard() {
  const { registrations, totalCount, loading, error } = useGameRegistrations(
    {},
  );

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchResult, setSearchResult] = useState(null); // null | "found" | "notfound"
  const [matchedTeam, setMatchedTeam] = useState(null);
  const inputRef = useRef(null);

  /* fuzzy search over registrations */
  const runSearch = useCallback(
    (q) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setSubmitted(true);
      const match = registrations.find((r) =>
        r.family.familyName.toLowerCase().includes(trimmed.toLowerCase()),
      );
      if (match) {
        setMatchedTeam(match);
        setSearchResult("found");
      } else {
        setMatchedTeam(null);
        setSearchResult("notfound");
      }
    },
    [registrations],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") runSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    setSubmitted(false);
    setSearchResult(null);
    setMatchedTeam(null);
    inputRef.current?.focus();
  };

  /* reset result when query changes after a search */
  useEffect(() => {
    if (submitted) {
      setSubmitted(false);
      setSearchResult(null);
      setMatchedTeam(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-4 font-sans">
      {/* ── Contact Card ── */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        <div className="px-6 pt-6 pb-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Kodava Hockey Tournament 2026
            </span>
          </div>

          <div>
            <p className="text-[10px] text-black font-medium uppercase tracking-widest mb-1">
              For Registrations, Contact
            </p>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              {CONTACT.name}
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">{CONTACT.role}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
              <MapPin className="w-3 h-3" />
              {CONTACT.location}
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-stone-400">Phone / WhatsApp</p>
              <p className="text-base font-bold text-stone-800 tabular-nums tracking-wide">
                {CONTACT.phone}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${CONTACT.raw}`}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all duration-150 shadow-md shadow-emerald-200"
            >
              <Phone className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Call Now</span>
            </a>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=Hi%2C+I%27d+like+to+register+for+the+Kodava+Hockey+Tournament+2026`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-900 hover:bg-stone-700 active:scale-95 transition-all duration-150 shadow-md shadow-stone-200"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">WhatsApp</span>
            </a>
          </div>

          <p className="text-center text-xs text-stone-400 leading-relaxed">
            Available Mon–Sat · 9 AM – 7 PM IST
          </p>
        </div>
      </div>

      {/* ── Team Search Panel ── */}
      <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
        {/* header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-widest">
              Find Your Team
            </span>
          </div>
          <p className="text-[11px] text-stone-400 leading-snug">
            Search by family name to check your registration status.
          </p>
        </div>

        {/* search input */}
        <div className="px-5 pb-5">
          <div
            className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
              focused
                ? "border-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                : "border-stone-200 bg-stone-50"
            }`}
          >
            <Search
              className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${
                focused ? "text-emerald-500" : "text-stone-300"
              }`}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Chenanda"
              className="w-full bg-transparent pl-10 pr-20 py-3 text-sm text-stone-800 placeholder:text-stone-300 outline-none rounded-2xl"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {query && (
                <button
                  onClick={clearSearch}
                  className="p-1 rounded-full text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-all"
                  aria-label="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => runSearch(query)}
                disabled={!query.trim() || loading}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all duration-150 active:scale-95"
              >
                Search
              </button>
            </div>
          </div>

          {/* ── Result area ── */}
          <div
            className={`transition-all duration-500 ease-out overflow-hidden ${
              searchResult ? "max-h-72 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            {searchResult === "found" && matchedTeam && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Registration found · ID #
                  {matchedTeam.payment.receiptNumber ?? "—"}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {matchedTeam.payment.gameIds.length === 2
                    ? "Men's & Women's teams registered"
                    : "Men's team registered"}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  Fixtures will be announced before the event
                </div>
              </div>
            )}

            {searchResult === "notfound" && (
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 animate-fadeSlideUp">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldAlert className="w-4.5 h-4.5 text-stone-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-700">
                      No team found for {query}
                    </p>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      If you&apos;ve registered, fixture details will be shared
                      once the schedule is released. Please contact the
                      coordinator for any queries.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Fixtures releasing soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 ">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 shadow-md shadow-emerald-200"
        >
          <motion.span
            initial={{ rotate: 0 }}
            whileInView={{ rotate: [0, -10, 10, -6, 6, 0] }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            🏑
          </motion.span>

          {loading ? (
            <span className="text-sm font-bold text-white">⏳ Loading...</span>
          ) : (
            <span className="text-sm font-bold text-white tabular-nums">
              {totalCount} Teams Registered 🎉
            </span>
          )}
        </motion.div>
      </div>

      {/* ── Attendees Marquee ── */}
      {/* <div className="rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Registered Teams
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600">
            {loading ? (
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            ) : (
              <span className="text-xs font-bold text-white tabular-nums">
                {totalCount} registered
              </span>
            )}
          </div>
        </div>

        <div className="py-3">
          {loading && registrations.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-stone-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading teams…
            </div>
          ) : error ? (
            <p className="text-center text-xs text-red-400 py-2">{error}</p>
          ) : registrations.length === 0 ? (
            <p className="text-center text-xs text-stone-400 py-2">
              No registrations yet — be the first!
            </p>
          ) : (
            <MarqueeTrack>
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm"
                >
                  <TeamAvatar name={reg.family.familyName} />
                  <span className="text-xs font-semibold text-stone-800 whitespace-nowrap">
                    {reg.family.familyName}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      reg.paymentStatus === "CONFIRMED"
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                    }`}
                    title={reg.paymentStatus}
                  />
                </div>
              ))}
            </MarqueeTrack>
          )}
        </div>
      </div> */}

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeSlideUp {
          animation: fadeSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
}
