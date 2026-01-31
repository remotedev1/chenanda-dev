"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { useRef, memo } from "react";

// Memoized Card Component to prevent re-renders
const Card = memo(({ children, className = "", delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.5,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <m.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </m.div>
  );
});

Card.displayName = "Card";

export default function AboutChenanda() {
  const shouldReduceMotion = useReducedMotion();

  const fadeIn = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-30px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-30px" });
  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: "-30px",
  });

  const stats = [
    { number: "300+", label: "Family Members" },
    { number: "5", label: "Locations" },
    { number: "2", label: "Olympians" },
    { number: "100+", label: "Years of Legacy" },
  ];

  const features = [
    { icon: "⚡", text: "Promoting youth sports" },
    { icon: "🌟", text: "Honoring past legends" },
    { icon: "🤝", text: "Strengthening community bonds" },
    { icon: "🚀", text: "Inspiring future athletes" },
  ];

  const achievements = [
    { icon: "🎖️", text: "Indian Army officers" },
    { icon: "🥇", text: "Olympians and sportspersons" },
    { icon: "📚", text: "Teachers and educators" },
    { icon: "🎭", text: "Cultural enthusiasts" },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 sm:py-16 md:py-20 px-3 sm:px-4 lg:px-8 overflow-hidden mt-16 sm:mt-20">
        {/* Decorative background - CSS only for performance */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-amber-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-orange-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <m.div
            ref={headerRef}
            variants={fadeIn}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            className="text-center mb-10 sm:mb-14 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-amber-900 mb-3 sm:mb-4 tracking-tight px-2">
              About the Chenanda Okka
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
          </m.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-10 sm:mb-14 md:mb-16">
            {/* Left Column - Heritage */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <Card
                delay={0.1}
                className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg sm:shadow-xl border border-amber-100 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="text-2xl sm:text-2xl md:text-3xl font-bold text-amber-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl" aria-hidden="true">
                    🏡
                  </span>
                  <span>Our Heritage</span>
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  The Chenanda Okka is a close-knit family of over{" "}
                  <span className="font-semibold text-amber-800">
                    300 members
                  </span>
                  , deeply rooted in{" "}
                  <span className="font-semibold text-amber-800">Kokeri</span>,
                  with family branches spread across Murnad, Banavara, Kettoli,
                  and Virajpet in the heart of Coorg.
                </p>
              </Card>

              <Card
                delay={0.2}
                className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg sm:shadow-xl border border-amber-100 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="text-2xl sm:text-2xl md:text-3xl font-bold text-amber-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl" aria-hidden="true">
                    🤝
                  </span>
                  <span>Our Values</span>
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  United across generations, the Okka stands as a symbol of{" "}
                  <span className="font-semibold text-amber-800">
                    togetherness
                  </span>
                  ,{" "}
                  <span className="font-semibold text-amber-800">
                    respect for elders
                  </span>
                  , and an enduring sense of{" "}
                  <span className="font-semibold text-amber-800">
                    belonging
                  </span>
                  .
                </p>
              </Card>
            </div>

            {/* Right Column - Achievements */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <Card
                delay={0.3}
                className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg sm:shadow-xl text-white hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
              >
                <h3 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl" aria-hidden="true">
                    🏆
                  </span>
                  <span>Legacy of Excellence</span>
                </h3>
                <div className="space-y-3 sm:space-y-4 text-base sm:text-lg leading-relaxed">
                  <p>
                    It is a matter of immense pride that members of the Chenanda
                    family have served the nation and society with distinction:
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-3 sm:ml-4">
                    {achievements.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <span
                          className="text-xl sm:text-2xl flex-shrink-0"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm sm:text-base md:text-lg">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card
                delay={0.4}
                className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg sm:shadow-xl border border-orange-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-orange-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">
                    ⭐
                  </span>
                  <span>National Recognition</span>
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  The family is especially honored to have produced{" "}
                  <span className="font-bold text-orange-800">
                    two eminent Olympians
                  </span>
                  , including recipients of the prestigious{" "}
                  <span className="font-bold text-orange-800">
                    Dronacharya Award
                  </span>{" "}
                  and{" "}
                  <span className="font-bold text-orange-800">
                    Arjuna Award
                  </span>
                  , reflecting a legacy of discipline, dedication, and sporting
                  excellence.
                </p>
              </Card>
            </div>
          </div>

          {/* Heritage & Culture Section */}
          <div className="mb-10 sm:mb-14 md:mb-16">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <Card
                delay={0.5}
                className="bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg sm:shadow-xl border border-purple-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <h4 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-purple-900">
                  <span className="text-3xl sm:text-4xl" aria-hidden="true">
                    🏠
                  </span>
                  <span>Ancestral Heritage</span>
                </h4>
                <p className="text-base sm:text-lg leading-relaxed text-gray-800">
                  The Chenanda Okka is home to a beautiful ancestral house in
                  Kokeri, a living testament to heritage, tradition, and
                  cultural continuity. The family remains committed to
                  preserving and passing on Kodava customs, values, and cultural
                  identity to future generations.
                </p>
              </Card>

              <Card
                delay={0.6}
                className="bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg sm:shadow-xl border border-indigo-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <h4 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-indigo-900">
                  <span className="text-3xl sm:text-4xl" aria-hidden="true">
                    🎯
                  </span>
                  <span>Cultural Commitment</span>
                </h4>
                <p className="text-base sm:text-lg leading-relaxed text-gray-800">
                  Alongside sporting achievements, the Chenanda family actively
                  preserves Kodava customs, traditional practices, and cultural
                  values, ensuring that each generation remains connected to
                  their rich heritage and identity.
                </p>
              </Card>
            </div>
          </div>

          {/* Hockey Legacy Section */}
          <Card delay={0.7} className="mb-10 sm:mb-14 md:mb-16">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl sm:shadow-2xl text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl" aria-hidden="true">
                  🏑
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  The Hockey Legacy
                </h3>
              </div>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed">
                Sports—particularly{" "}
                <span className="font-bold underline decoration-white/50">
                  hockey
                </span>
                —run deep in the Chenanda lineage. Across generations, the
                family has actively contributed to the rich Kodava hockey
                culture by nurturing talent, mentoring young players, and
                upholding the spirit of sportsmanship that Coorg is known for.
              </p>
            </div>
          </Card>

          {/* Tournament Announcement */}
          <m.div
            ref={featuresRef}
            variants={staggerContainer}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="mb-10 sm:mb-14 md:mb-16"
          >
            <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-xl sm:shadow-2xl overflow-hidden">
              {/* Decorative elements */}
              <div
                className="absolute top-0 right-0 w-40 sm:w-48 md:w-64 h-40 sm:h-48 md:h-64 bg-white/10 rounded-full blur-3xl"
                aria-hidden="true"
              ></div>
              <div
                className="absolute bottom-0 left-0 w-40 sm:w-48 md:w-64 h-40 sm:h-48 md:h-64 bg-white/10 rounded-full blur-3xl"
                aria-hidden="true"
              ></div>

              <div className="relative text-center text-white">
                <div className="inline-block mb-3 sm:mb-4">
                  <span
                    className="text-5xl sm:text-6xl md:text-7xl"
                    aria-hidden="true"
                  >
                    🏆
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
                  Chenanda Hockey Tournament 2026
                </h3>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 md:px-8 inline-block border-2 border-white/40">
                  5th April 2026
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-8 px-2">
                  Carrying this legacy forward, the Chenanda family is proud to
                  organize a Hockey Tournament with the purpose of:
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
                  {features.map((item, index) => (
                    <m.div
                      key={index}
                      variants={itemVariants}
                      className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border-2 border-white/40 hover:bg-white/30 hover:scale-105 transition-all duration-300"
                    >
                      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">
                        {item.icon}
                      </div>
                      <div className="text-sm sm:text-base md:text-lg font-semibold">
                        {item.text}
                      </div>
                    </m.div>
                  ))}
                </div>
              </div>
            </div>
          </m.div>

          {/* Closing Statement */}
          <Card delay={0.8} className="text-center mb-10 sm:mb-14 md:mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg sm:shadow-xl border border-amber-200 max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-900 leading-relaxed italic px-2">
                &ldquo;Rooted in tradition and driven by excellence, the
                Chenanda Okka continues to shape the future while honoring its
                past.&rdquo;
              </p>
            </div>
          </Card>

          {/* Bottom Stats Bar */}
          <m.div
            ref={statsRef}
            variants={staggerContainer}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
          >
            {stats.map((stat, index) => (
              <m.div
                key={index}
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center shadow-md sm:shadow-lg border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-600 mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </div>
              </m.div>
            ))}
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
