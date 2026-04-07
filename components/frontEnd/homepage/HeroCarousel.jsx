"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const SLIDES = [
  {
    id: 1,
    title: ["Kodava Hockey", "Festival"],

    image: "/slides/slide-1.jpg",
  },
  {
    id: 2,
    title: ["A Legacy", "in the Making"],

    image: "/slides/slide-2.jpg",
  },
  {
    id: 3,
    title: ["Champions", "Are Forged Here"],

    image: "/slides/slide-3.jpg",
  },
  {
    id: 4,
    title: ["Where Kodava", "Pride Plays"],

    image: "/slides/slide-4.jpg",
  },
  {
    id: 5,
    title: ["Kodava Hockey", "Festival"],

    image: "/slides/slide-5.jpg",
  },
  {
    id: 6,
    title: ["Stories from", "the Field"],

    image: "/slides/slide-6.jpg",
  },
];

const STATS = [
  { value: "400+", label: "Teams" },
  { value: "6000+", label: "Players" },
];

const AUTOPLAY_MS = 5000;

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronIcon({ dir }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3.5 h-3.5"
      aria-hidden
    >
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3.5 h-3.5"
      aria-hidden
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setProgress(0);
      setCurrent(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
      setTimeout(() => setIsAnimating(false), 800);
    },
    [isAnimating],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay + progress ticker
  useEffect(() => {
    if (paused) {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
      return;
    }

    setProgress(0);
    const tick = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + (tick / AUTOPLAY_MS) * 100, 100));
    }, tick);

    timerRef.current = setTimeout(next, AUTOPLAY_MS);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [current, paused, next]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === " ") setPaused((p) => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black"
      aria-label="Kodava Hockey Festival hero carousel"
      aria-roledescription="carousel"
    >
      <div className="absolute  left-5 md:left-[7rem]  bottom-10 md:bottom-[10rem]      z-30 ">
        <div className="w-[94vw] h-[50vh]  md:w-[60vw] mx-auto relative">
          <Image
            src="/logo-title.png"
            alt=""
            fill
            className="object-contain pointer-events-none select-none"
            aria-hidden
          />
        </div>
      </div>
      {/* ── Slides ── */}
      {SLIDES.map((slide, i) => {
        const isActive = i === current;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${SLIDES.length}: ${slide.title.join(" ")}`}
            aria-hidden={!isActive}
            className={[
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              isActive ? "opacity-100" : "opacity-0 pointer-events-none",
            ].join(" ")}
          >
            {/* 2. Background image — above gradient */}
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              sizes="100vw"
              className="object-cover object-center z-[1]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            {/* 3. Dark overlay — above image, for text legibility */}
            <div className="absolute inset-0 z-[2] bg-black/50" aria-hidden />

            {/* 4. Slide content — highest layer */}
            <div
              className={[
                "absolute bottom-[90px] left-5 md:left-[120px]  z-10 max-w-[520px]",
                "transition-all duration-&lsqb;600ms&rsqb; ease-out",
                isActive
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5",
              ].join(" ")}
              style={{ transitionDelay: isActive ? "300ms" : "0ms" }}
            >
              <h2 className="font-display text-3xl lg:text-[3rem] font-extrabold text-white/75 leading-none tracking-tight uppercase mb-3.5">
                {slide.title.map((line, j) => (
                  <span key={j} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </div>
          </div>
        );
      })}

      {/* ── Stats + Controls bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 md:px-11 py-[18px]"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      >
        <div className="max-w-7xl px-6 md:px-0 mx-auto flex">
          {/* Stats */}
          <div className="flex items-center gap-10 ">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="font-display text-lg md:text-xl font-extrabold text-white leading-none">
                  {s.value}
                </span>
                <span className=" font-semibold   text-lg md:text-xl tracking-[2px] text-white/55 uppercase mt-0.5">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Controls */}
          <div className="flex items-center gap-2 ">
            {/* Segmented Progress Bars — hidden on small screens */}
            <div
              className="hidden sm:flex items-center gap-[5px]"
              role="tablist"
              aria-label="Slide navigation"
            >
              {SLIDES.map((_, i) => {
                const isActive = i === current;
                const isPast = i < current;
                return (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    className="group relative h-[3px] rounded-full overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 transition-all duration-300"
                    style={{ width: isActive ? 36 : 14 }}
                  >
                    <span
                      className={[
                        "absolute inset-0 rounded-full transition-colors duration-300",
                        isPast
                          ? "bg-white/70"
                          : "bg-white/20 group-hover:bg-white/35",
                      ].join(" ")}
                    />
                    {isActive && (
                      <span
                        className="absolute inset-y-0 left-0 bg-white rounded-full"
                        style={{
                          width: `${progress}%`,
                          transition: "width 50ms linear",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider — hidden on small screens */}
            <div className="hidden sm:block w-px h-4 bg-white/15 mx-1" />

            {/* Counter — hidden on small screens */}
            <span className="hidden sm:inline text-[11px] tabular-nums tracking-widest text-white/40 select-none">
              <span className="text-white/90 font-medium">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span className="mx-1 text-white/20">/</span>
              {String(SLIDES.length).padStart(2, "0")}
            </span>

            {/* Divider — hidden on small screens */}
            <div className="hidden sm:block w-px h-4 bg-white/15 mx-1" />

            {/* Controls — always visible */}
            <div className="flex items-center gap-1">
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <ChevronIcon dir="left" />
              </button>

              <button
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                aria-pressed={paused}
                className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>

              <button
                onClick={next}
                aria-label="Next slide"
                className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <ChevronIcon dir="right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
