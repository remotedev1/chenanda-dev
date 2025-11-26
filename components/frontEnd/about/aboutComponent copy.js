"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const teamMembers = [
  {
    name: "Sabu Machaiah",
    title:
      "Arjuna Awardee (2001), Olympian boxer, six-time international medalist.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Vishu Kuttappa",
    title: "Dronacharya Awardee (2018), national boxing coach and mentor.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    color: "from-red-500 to-pink-600",
  },
  {
    name: "Naveen Kumar C.M",
    title: "Senior National Kabaddi Gold Medalist, Kempegowda Awardee.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Brig. C.M. Cheeyanna",
    title: "Distinguished military leader and advisor to the committee.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    color: "from-emerald-500 to-teal-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const AboutComponent = () => {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame to throttle updates to monitor refresh rate
      rafRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        // Only update if scroll changed significantly (reduces re-renders by ~70%)
        if (Math.abs(currentScrollY - lastScrollY.current) > 2) {
          setScrollY(currentScrollY);
          lastScrollY.current = currentScrollY;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Memoize expensive calculations
  const animations = useMemo(
    () => ({
      playerRotation: scrollY * 0.2,
      playerScale: 1 + scrollY * 0.0005,
      stickRotation: scrollY * 0.3,
      ballX: Math.sin(scrollY * 0.01) * 20,
      ballY: Math.cos(scrollY * 0.01) * 10,
      circleOpacity: Math.max(0.3, 1 - scrollY * 0.002),
      logoStickRotation: 15 + Math.sin(scrollY * 0.005) * 10,
      logoBallY: Math.sin(scrollY * 0.008) * 3,
      logoBallScale: 1 + Math.sin(scrollY * 0.01) * 0.2,
      ring1Scale: 1.1 + Math.sin(scrollY * 0.01) * 0.1,
      ring1Rotation: scrollY * 0.1,
      ring2Scale: 1.2 + Math.cos(scrollY * 0.015) * 0.05,
      ring2Rotation: -scrollY * 0.15,
      ballScale: 0.8 + Math.sin(scrollY * 0.02) * 0.3,
    }),
    [scrollY]
  );

  // Memoize particle positions to avoid recalculating on every render
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        left: `${20 + i * 10}%`,
        top: `${20 + i * 8}%`,
        translateY: Math.sin(scrollY * 0.01 + i) * 20,
        translateX: Math.cos(scrollY * 0.015 + i) * 15,
        delay: `${i * 0.1}s`,
      })),
    [scrollY]
  );

  return (
    <div className="min-h-[500vh] bg-black relative pt-24">
      {/* Fixed background animation container */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-96 h-96">
          {/* Red circle background */}
          <div
            className="absolute inset-0 rounded-full transition-opacity duration-300"
            style={{
              opacity: animations.circleOpacity,
              transform: `scale(${animations.playerScale})`,
              background: `radial-gradient(circle at 30% 30%, #FFBF00, #E49B0F)`,
              willChange: "opacity, transform",
            }}
          />

          {/* Animated rings around the circle */}
          <div
            className="absolute inset-0 rounded-full border-4 border-red-400 opacity-20"
            style={{
              transform: `scale(${animations.ring1Scale}) rotate(${animations.ring1Rotation}deg)`,
              willChange: "transform",
            }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-red-300 opacity-30"
            style={{
              transform: `scale(${animations.ring2Scale}) rotate(${animations.ring2Rotation}deg)`,
              willChange: "transform",
            }}
          />

          {/* Hockey player silhouette */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${animations.playerRotation}deg) scale(${animations.playerScale})`,
              willChange: "transform",
            }}
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 400 400"
              className="fill-black drop-shadow-lg"
            >
              {/* Player body */}
              <g transform="translate(200, 200)">
                {/* Head */}
                <circle cx="0" cy="-80" r="25" />
                {/* Hair/ponytail */}
                <path d="M -20,-85 Q -35,-95 -25,-105 Q -15,-100 -10,-95" />

                {/* Torso */}
                <ellipse cx="0" cy="-30" rx="35" ry="45" />

                {/* Arms */}
                <ellipse
                  cx="-25"
                  cy="-40"
                  rx="15"
                  ry="35"
                  transform="rotate(-20)"
                />
                <ellipse
                  cx="25"
                  cy="-25"
                  rx="15"
                  ry="40"
                  transform="rotate(25)"
                />

                {/* Legs */}
                <ellipse
                  cx="-15"
                  cy="30"
                  rx="18"
                  ry="50"
                  transform="rotate(-15)"
                />
                <ellipse
                  cx="15"
                  cy="35"
                  rx="18"
                  ry="50"
                  transform="rotate(20)"
                />

                {/* Hands/gloves */}
                <circle cx="-35" cy="-15" r="12" />
                <circle cx="40" cy="0" r="12" />
              </g>
            </svg>
          </div>

          {/* Hockey stick */}
          <div
            className="absolute"
            style={{
              left: "60%",
              top: "45%",
              transform: `rotate(${45 + animations.stickRotation}deg)`,
              transformOrigin: "top left",
              willChange: "transform",
            }}
          >
            <div className="w-2 h-32 bg-black rounded-full shadow-lg" />
            <div className="w-8 h-6 bg-black rounded-lg -mt-1 -ml-3" />
          </div>

          {/* Hockey ball */}
          <div
            className="absolute w-4 h-4 bg-black rounded-full shadow-lg transition-all duration-300"
            style={{
              left: `${55 + animations.ballX}%`,
              top: `${75 + animations.ballY}%`,
              transform: `scale(${animations.ballScale})`,
              willChange: "transform",
            }}
          />

          {/* Particle effects */}
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full opacity-60"
              style={{
                left: particle.left,
                top: particle.top,
                transform: `translateY(${particle.translateY}px) translateX(${particle.translateX}px)`,
                animationDelay: particle.delay,
                willChange: "transform",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content sections to enable scrolling */}
      <div className="relative z-10 space-y-screen">
        <section className="h-screen flex items-center px-4 md:px-8 lg:px-16 overflow-hidden">
          <div className="text-white max-w-6xl mx-auto h-full flex flex-col py-6 md:py-8">
            <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 text-red-400 uppercase flex-shrink-0">
              Chenanda Okka: A Legacy of Loyalty and Tradition
            </h1>
          </div>
        </section>

        <section className="h-screen flex items-center justify-end pr-16">
          <div className="text-white max-w-6xl mx-auto h-full flex flex-col py-6 md:py-8">
            <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 text-red-400 uppercase flex-shrink-0">
              Papuli & the Ancestral Bond: Legacy Forged in Loyalty
            </h1>

            <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="space-y-2 md:space-y-3 lg:space-y-4 max-w-4xl">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed md:leading-7 lg:leading-8 tracking-wide text-justify">
                  In the misty highlands of{" "}
                  <span className="font-semibold text-yellow-300">Kodagu</span>,
                  where ancestral spirits still whisper through rustling
                  forests, stands the sacred{" "}
                  <span className="font-semibold">Gurumane</span> of the
                  Chenanda family in{" "}
                  <span className="font-semibold">Kokeri</span> a 360-year-old
                  testament to heritage, faith, and resilience.
                </p>

                <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed md:leading-7 lg:leading-8 tracking-wide text-justify">
                  At the heart of this story is{" "}
                  <span className="font-semibold">Papuli</span>, the legendary
                  bull of our forefather
                  <span className="font-semibold"> Godhari Uthaiah</span>, a man
                  revered for his wealth in cattle and, deeper still, his
                  devotion. One day, while leading twenty-five bulls bearing
                  rice on a pilgrimage to the
                  <span className="font-semibold"> Payyavoor Shiva Temple</span>
                  , Uthaiah&apos;s favourite, Papuli distinguished by dark, soulful
                  circles around his eyes vanished without a trace in the dense
                  woods near
                  <span className="font-semibold"> Bannai Kadavu</span>.
                </p>

                <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed md:leading-7 lg:leading-8 tracking-wide text-justify">
                  Grief-stricken, Uthaiah waded into the sacred{" "}
                  <span className="font-semibold">Udumbe River</span>, pledging
                  to honor Papuli with a sacred{" "}
                  <span className="font-semibold">Theyyam</span> ritual for
                  generations if only he returned. Miraculously, Papuli did.
                  Fatally wounded by a tiger, the loyal bull returned home,
                  circled the ancestral
                  <span className="font-semibold"> Karona</span> three times,
                  and collapsed.
                </p>

                <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed md:leading-7 lg:leading-8 tracking-wide text-justify">
                  To this day, this bond lives on not just in memory, but in
                  ritual, reverence, and in the
                  <span className="font-semibold"> Chenanda family emblem</span>
                  , the first of its kind in Coorg. It is more than a symbol; it
                  is a spiritual covenant a promise of loyalty, sacrifice, and
                  enduring tradition.
                </p>

                <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed md:leading-7 lg:leading-8 tracking-wide text-justify">
                  This spirit of unwavering devotion carries through everything
                  the Chenanda family does from service in the armed forces, to
                  education, to this very festival which stands as our living
                  legacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="h-screen flex items-center justify-center">
          <div className="text-white max-w-md text-center">
            <h2 className="text-4xl font-bold mb-6 text-red-400">
              Interactive{" "}
            </h2>
            <p className="text-xl leading-relaxed">lorem</p>
          </div>
        </section>

        <section className="h-screen flex items-center justify-start pl-16">
          <div className="text-white max-w-md">
            <h2 className="text-4xl font-bold mb-6 text-red-400">Visual </h2>
            <p className="text-xl leading-relaxed">lorem</p>
          </div>
        </section>

        <section className="h-screen flex flex-col items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-red-400"
          >
            PRIDE OF CHENANDA
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6 px-4"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="group perspective max-w-sm"
              >
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-10`}
                  ></div>

                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full"
                    >
                      <Image
                        fill
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    <div
                      className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${member.color} opacity-80 rounded-bl-full`}
                    ></div>
                  </div>

                  <div className="p-6 relative z-20">
                    <motion.h3
                      className="text-xl font-bold text-amber-800 mb-3 group-hover:text-amber-900 transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {member.name}
                    </motion.h3>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {member.title}
                    </p>

                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className={`h-1 bg-gradient-to-r ${member.color} mt-4 rounded-full`}
                    ></motion.div>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-30">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-12 h-12 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-white font-bold text-lg">
                        {index + 1}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-amber-700 italic text-lg font-serif mb-8">
              Honoring legacy, celebrating excellence
            </p>

            {/* View More Button */}
            <motion.a
              href="/pride-of-chenanda"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <span>View More</span>
              <motion.svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </motion.svg>
            </motion.a>
          </motion.div>
        </section>
      </div>

      {/* Scroll indicator */}
      <div className="fixed bottom-8 right-8 text-white text-sm opacity-60 z-20">
        Scroll: {Math.round(scrollY)}px
      </div>
    </div>
  );
};

export default AboutComponent;
