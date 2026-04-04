"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { Trophy, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

const AnimatedNumber = memo(({ value }) => {
  const shouldReduceMotion = useReducedMotion();
  const formattedValue = String(value).padStart(2, "0");

  return (
    <div className="relative h-10 w-8 sm:h-14 sm:w-12 md:h-16 md:w-14 overflow-hidden flex justify-center items-center">
      <m.span
        key={formattedValue}
        initial={{ y: shouldReduceMotion ? 0 : 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: shouldReduceMotion ? 0 : -16, opacity: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="absolute text-2xl sm:text-4xl md:text-5xl font-black font-mono text-white"
      >
        {formattedValue}
      </m.span>
    </div>
  );
});

AnimatedNumber.displayName = "AnimatedNumber";

const EventCountdown = () => {
  const shouldReduceMotion = useReducedMotion();

  const headerRef = useRef(null);
  const countdownRef = useRef(null);
  const statsRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-30px" });
  const countdownInView = useInView(countdownRef, {
    once: true,
    margin: "-30px",
  });
  const statsInView = useInView(statsRef, { once: true, margin: "-30px" });

  const targetDate = useMemo(() => new Date("2026-04-05T10:00:00"), []);

  const calculateTimeLeft = useCallback(() => {
    const difference = +targetDate - +new Date();
    if (difference <= 0) return null;
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(() => {
      if (mounted) {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        if (!newTimeLeft) clearInterval(timer);
      }
    }, 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [calculateTimeLeft]);

  const stats = useMemo(
    () => [
      { num: "400+", label: "Teams" },
      { num: "6000+", label: "Players" },
      { num: "395+", label: "Matches" },
      { num: "27", label: "Days" },
    ],
    [],
  );

  const countdownUnits = useMemo(
    () => [
      { key: "days", label: "Days" },
      { key: "hours", label: "Hrs" },
      { key: "minutes", label: "Min" },
      { key: "seconds", label: "Sec" },
    ],
    [],
  );

  const fadeInUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.45,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative min-h-screen flex items-center justify-center bg-primary overflow-hidden py-12 px-4">
        <div className="relative z-10 text-center max-w-3xl w-full mx-auto">
          {/* Badge */}
          <m.div
            ref={headerRef}
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Trophy className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">
                Kodava Hockey Tournament 2026
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight mb-6">
              CHENANDA
            </h1>

            {/* Event meta */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Calendar className="w-4 h-4" />
                <span>April 5 – May 2, 2026</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Gen. Thimmaiah Stadium, Napoklu</span>
              </div>
            </div>
          </m.div>

          {/* Countdown — only shown when time remains */}
          {timeLeft ? (
            <m.div
              ref={countdownRef}
              variants={fadeInUp}
              initial="hidden"
              animate={countdownInView ? "visible" : "hidden"}
              className="mb-10"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-5 font-semibold">
                Tournament starts in
              </p>
              <div className="flex justify-center items-start gap-2 sm:gap-4">
                {countdownUnits.map((unit, index) => (
                  <div key={unit.key} className="flex items-start">
                    <div className="flex flex-col items-center">
                      <div className="bg-white/8 border border-white/10 rounded-xl px-3 sm:px-5 py-2 sm:py-3">
                        <AnimatedNumber value={timeLeft[unit.key]} />
                      </div>
                      <span className="text-white/30 text-[10px] uppercase tracking-widest mt-2 font-medium">
                        {unit.label}
                      </span>
                    </div>
                    {index < countdownUnits.length - 1 && (
                      <span className="text-white/20 text-2xl font-light mx-1 mt-3">
                        :
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </m.div>
          ) : (
            <m.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-10"
            >
              <div className="inline-flex items-center gap-2.5 border border-white/20 rounded-full px-5 py-2.5">
                {/* Pulsing live dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-white text-sm font-semibold tracking-wide">
                  Tournament is Live
                </span>
              </div>
            </m.div>
          )}

          {/* Stats */}
          <m.div
            ref={statsRef}
            variants={fadeInUp}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="mb-10"
          >
            <div className="grid grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-primary py-5 px-2 text-center"
                >
                  <div className="text-xl sm:text-3xl font-black text-white">
                    {stat.num}
                  </div>
                  <div className="text-white/35 text-[10px] uppercase tracking-wider mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </m.div>

          {/* CTA */}
          <m.div variants={fadeInUp} initial="hidden" animate="visible">
            <Link
              href="/about-tournament"
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium px-6 py-3 rounded-full transition-all duration-200"
            >
              Know more
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default EventCountdown;
