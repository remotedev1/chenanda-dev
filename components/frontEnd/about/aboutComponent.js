"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Home,
  Users,
  Calendar,
  Flame,
  Award,
  Shield,
  Briefcase,
  ChevronDown,
  Leaf,
  Mountain,
} from "lucide-react";

const ChenandaAbout = () => {
  // Optimized animation variants - reduced complexity
  const fadeInUp = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }), []);

  const fadeInScale = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }), []);

  const staggerContainer = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }), []);

  // Reusable Components
  const Section = ({ id, children, className = "", gradient = "" }) => (
    <section
      id={id}
      className={`py-16 md:py-20 px-4 relative overflow-hidden ${gradient} ${className}`}
    >
      <div className="max-w-6xl mx-auto relative z-10">{children}</div>
    </section>
  );

  const SectionHeader = ({ icon: Icon, title, subtitle, light = false }) => (
    <motion.div
      className="text-center mb-12 md:mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      <div
        className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full mb-6 shadow-xl ${
          light
            ? "bg-emerald-500"
            : "bg-gradient-to-br from-green-600 to-emerald-600"
        }`}
      >
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </div>
      <h2
        className={`text-3xl md:text-5xl font-bold mb-3 ${
          light ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg md:text-xl ${light ? "text-green-100" : "text-gray-600"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );

  const Card = ({ children, delay = 0, className = "" }) => (
    <motion.div
      className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 md:p-8 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInScale}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );

  const GradientCard = ({ children, className = "" }) => (
    <motion.div
      className={`rounded-2xl shadow-xl p-6 md:p-10 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );

  const Grid = ({ children, cols = 3 }) => (
    <motion.div
      className={`grid md:grid-cols-${cols} gap-6 md:gap-8`}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );

  const FeatureBox = ({ emoji, title, description, delay = 0 }) => (
    <Card delay={delay}>
      <div className="text-5xl md:text-6xl mb-4 md:mb-5">{emoji}</div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </Card>
  );

  const ListItem = ({ icon, title, subtitle, delay = 0 }) => (
    <motion.div
      className="flex items-start space-x-4 p-4 md:p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInScale}
      transition={{ delay }}
    >
      <span className="text-3xl md:text-4xl">{icon}</span>
      <div>
        <h4 className="font-bold text-lg md:text-xl text-gray-800">{title}</h4>
        <p className="text-gray-600 text-sm md:text-base">{subtitle}</p>
      </div>
    </motion.div>
  );

  const Badge = ({ icon, text, delay = 0 }) => (
    <motion.div
      className="flex items-center space-x-3 p-4 md:p-5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInScale}
      transition={{ delay }}
    >
      <span className="text-2xl md:text-3xl">{icon}</span>
      <span className="text-base md:text-lg font-semibold text-gray-800">{text}</span>
    </motion.div>
  );

  const ProfCard = ({ emoji, title, description, delay = 0 }) => (
    <motion.div
      className="p-5 md:p-7 bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInScale}
      transition={{ delay }}
    >
      <div className="text-4xl md:text-5xl mb-4">{emoji}</div>
      <h4 className="text-lg md:text-xl font-bold mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-600 text-sm md:text-base">{description}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Simplified Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 text-white overflow-hidden">
        {/* Static Leaf Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 Q40 20 30 30 Q20 20 30 10' fill='%23ffffff' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl">


          <motion.h1
            className="text-5xl md:text-8xl font-bold mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Chenanda Family
          </motion.h1>

          <motion.p
            className="text-2xl md:text-4xl mb-5 text-green-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Preserving Heritage, Celebrating Unity
          </motion.p>

          <motion.p
            className="text-lg md:text-2xl text-green-200 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            First Kodava family to ideate, create, and register an official
            family logo
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="inline-block bg-white/20 backdrop-blur-md px-6 md:px-10 py-4 md:py-6 rounded-2xl border-2 border-white/40 shadow-2xl">
              <p className="text-xl md:text-2xl font-semibold">Proud Hosts of</p>
              <p className="text-2xl md:text-4xl font-bold text-green-300 mt-2">
                Kodava Hockey Festival 2026
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 md:w-10 md:h-10 text-white opacity-80" />
        </motion.div>
      </section>

      {/* Overview */}
      <Section id="overview" gradient="bg-gradient-to-b from-white to-green-50">
        <SectionHeader
          icon={Trophy}
          title="Our Legacy"
          subtitle="A lineage of honor, tradition, and excellence"
        />
        <Grid cols={3}>
          {[
            {
              emoji: "🏛️",
              title: "Rich Heritage",
              description:
                "Centuries of Kodava traditions preserved through oral histories and sacred practices",
            },
            {
              emoji: "🏆",
              title: "Achievement",
              description:
                "Excellence in sports, armed forces, and professional fields across generations",
            },
            {
              emoji: "🤝",
              title: "Unity",
              description:
                "Strong bonds maintained through regular celebrations and family gatherings",
            },
          ].map((feature, i) => (
            <FeatureBox key={i} {...feature} delay={i * 0.1} />
          ))}
        </Grid>

        <GradientCard className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white mt-12 md:mt-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">The Chenanda Logo</h3>
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <p className="text-lg md:text-xl mb-5 leading-relaxed">
                In a historic first, the Chenanda family became the pioneering
                Kodava family to ideate, create, and officially register a
                family logo.
              </p>
              <p className="text-lg md:text-xl mb-5 leading-relaxed">
                This emblem represents our collective identity, values, and the
                unbreakable bond that ties generations together.
              </p>
              <p className="text-green-200 font-semibold text-base md:text-lg">
                Symbolism: Unity, Heritage, and Progress
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 md:p-10 text-center">
              <div className="w-40 h-40 md:w-56 md:h-56 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-6xl md:text-8xl font-bold bg-gradient-to-br from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  C
                </span>
              </div>
              <p className="mt-6 text-green-100 text-base md:text-lg">
                Official Family Logo
              </p>
            </div>
          </div>
        </GradientCard>
      </Section>

      {/* Ainmane */}
      <Section
        id="ainmane"
        gradient="bg-gradient-to-b from-green-50 to-emerald-50"
      >
        <SectionHeader
          icon={Home}
          title="Ainmane"
          subtitle="The sacred ancestral home"
        />
        <Grid cols={2}>
          {[
            {
              emoji: "🏡",
              title: "Prehistoric Settlement",
              description:
                "Oral traditions tell how our ancestors first arrived and established roots in this sacred land.",
            },
            {
              emoji: "🏛️",
              title: "Architecture",
              description:
                "Unique architectural elements reflecting Kodava design principles for spiritual and practical purposes.",
            },
            {
              emoji: "🕉️",
              title: "Rituals & Practices",
              description:
                "Daily prayers, customs, and ceremonies maintaining spiritual essence through centuries.",
            },
            {
              emoji: "📸",
              title: "Visual Heritage",
              description:
                "Photographs capturing the Ainmane through time, showing evolution while maintaining sacred character.",
            },
          ].map((item, i) => (
            <Card key={i} delay={i * 0.1}>
              <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">
                {item.emoji} {item.title}
              </h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* History */}
      <Section
        id="history"
        gradient="bg-gradient-to-b from-emerald-50 to-white"
      >
        <SectionHeader
          icon={Users}
          title="Family History"
          subtitle="Tracing our journey through time"
        />
        <div className="space-y-6 md:space-y-8">
          <GradientCard className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100">
            <h3 className="text-3xl md:text-4xl font-bold text-green-800 mb-5">
              🏰 Medieval History
            </h3>
            <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
              Our family&apos;s roots trace back to significant land ownership,
              strategic alliances, and contributions during medieval times.
            </p>
          </GradientCard>

          <GradientCard className="bg-gradient-to-r from-teal-100 via-emerald-100 to-green-100">
            <h3 className="text-3xl md:text-4xl font-bold text-green-800 mb-5">
              🙏 Guru Karona Lineage
            </h3>
            <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
              Our ancestral practices and traditions are deeply rooted in the
              Guru Karona lineage, shaping our spiritual identity.
            </p>
          </GradientCard>

          <Card>
            <h3 className="text-3xl md:text-4xl font-bold text-green-800 mb-6 md:mb-8">
              🗺️ Family Settlements
            </h3>
            <Grid cols={2}>
              {["Murnad", "Siddapura", "Banavara", "Kettoli (Virajpet)"].map(
                (loc, i) => (
                  <Badge key={i} icon="📍" text={loc} delay={i * 0.1} />
                )
              )}
            </Grid>
          </Card>

          <GradientCard className="bg-gradient-to-br from-green-700 to-emerald-800 text-white text-center">
            <Mountain className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">📅 Family Tree</h3>
            <p className="text-lg md:text-xl mb-3">
              To be published post 9th May (if permitted)
            </p>
            <p className="text-green-200 text-base md:text-lg">
              Interactive visual display tracing ancestry
            </p>
          </GradientCard>
        </div>
      </Section>

      {/* Celebrations */}
      <Section
        id="celebrations"
        gradient="bg-gradient-to-b from-white to-green-50"
      >
        <SectionHeader
          icon={Calendar}
          title="Celebrations & Events"
          subtitle="The living spirit of our unity"
        />
        <Card className="mb-8 md:mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 md:mb-8">
            🎊 Regular Gatherings
          </h3>
          <div className="space-y-4 md:space-y-5">
            {[
              { icon: "🗓️", title: "Kombat Namme", date: "December 16" },
              { icon: "🌅", title: "Orrame", date: "Day after Kombat Namme" },
              { icon: "🎉", title: "Yeth There", date: "Biennial - July" },
              {
                icon: "🐍",
                title: "Naga Pooja",
                date: "On Subhramanya Shristi",
              },
              {
                icon: "🙏",
                title: "Bagavath Namme",
                date: "Around April 21-24",
              },
            ].map((event, i) => (
              <ListItem key={i} {...event} delay={i * 0.1} />
            ))}
          </div>
        </Card>

        <Grid cols={2}>
          <GradientCard className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              🎊 Traditional Festivals
            </h3>
            <ul className="space-y-3 md:space-y-4 text-lg md:text-xl">
              {["Changrandi", "Kail Podh", "Puthari"].map((f, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <span className="text-green-300">✦</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </GradientCard>

          <Card>
            <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-5">
              💰 Family Fund
            </h3>
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
              Supporting community initiatives with transparent reporting for
              all members.
            </p>
          </Card>
        </Grid>
      </Section>

      {/* Kaimada */}
      <Section
        id="kaimada"
        gradient="bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900"
        className="text-white"
      >
        <SectionHeader
          icon={Flame}
          title="Kaimada"
          subtitle="Sacred space of ancestral connection"
          light={true}
        />
        <Grid cols={2}>
          {[
            {
              emoji: "🏛️",
              title: "Sacred Structure",
              description:
                "The place where we honor ancestors through offerings and rituals.",
            },
            {
              emoji: "🕯️",
              title: "Meedi Offerings",
              description:
                "Traditional offerings performed with reverence, maintaining sacred connections.",
            },
            {
              emoji: "📅",
              title: "Worship Dates",
              description:
                "Predefined dates ensuring continuous spiritual practice and participation.",
            },
            {
              emoji: "✨",
              title: "Guardian Spirits",
              description:
                "Stories of guardian deities and spirits preserved and honored.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-white/20"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-green-300 mb-4">
                {item.emoji} {item.title}
              </h3>
              <p className="text-gray-200 text-base md:text-lg leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </Grid>
      </Section>

      {/* Achievers */}
      <Section
        id="achievers"
        gradient="bg-gradient-to-b from-green-50 to-white"
      >
        <SectionHeader
          icon={Award}
          title="Our Achievers"
          subtitle="Pride and inspiration across generations"
        />

        <GradientCard className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white mb-8 md:mb-12">
          <div className="flex items-center space-x-4 md:space-x-5 mb-6 md:mb-8">
            <Trophy className="w-10 h-10 md:w-14 md:h-14" />
            <h3 className="text-3xl md:text-4xl font-bold">Sports Excellence</h3>
          </div>
          <Grid cols={2}>
            {[
              {
                emoji: "🥊",
                title: "Boxing Champions",
                description: "National and international recognition",
              },
              {
                emoji: "🤼",
                title: "Kabaddi Stars",
                description: "Represented at highest levels",
              },
              {
                emoji: "🏑",
                title: "Hockey Heritage",
                description: "Decades of festival participation",
              },
              {
                emoji: "🌟",
                title: "Emerging Talents",
                description: "Young athletes across disciplines",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-5 md:p-7"
              >
                <h4 className="text-xl md:text-2xl font-bold mb-3 text-cyan-200">
                  {item.emoji} {item.title}
                </h4>
                <p className="text-gray-200 text-base md:text-lg">{item.description}</p>
              </div>
            ))}
          </Grid>
        </GradientCard>

        <GradientCard className="bg-gradient-to-br from-green-600 via-emerald-700 to-teal-700 text-white mb-8 md:mb-12">
          <div className="flex items-center space-x-4 md:space-x-5 mb-6 md:mb-8">
            <Shield className="w-10 h-10 md:w-14 md:h-14" />
            <h3 className="text-3xl md:text-4xl font-bold">Armed Forces</h3>
          </div>
          <p className="text-xl md:text-2xl mb-6 md:mb-8 text-green-100">
            Proud tradition of military service across ranks
          </p>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 md:p-8">
            <h4 className="text-xl md:text-2xl font-bold mb-4 text-green-200">
              🎖️ Honours & Medals
            </h4>
            <p className="text-gray-200 text-lg md:text-xl leading-relaxed">
              Stories of courage, dedication, and distinguished service to the
              nation.
            </p>
          </div>
        </GradientCard>

        <Card>
          <div className="flex items-center space-x-4 md:space-x-5 mb-8 md:mb-10">
            <Briefcase className="w-10 h-10 md:w-14 md:h-14 text-green-700" />
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">Professionals</h3>
          </div>
          <Grid cols={3}>
            {[
              {
                emoji: "👨‍⚕️",
                title: "Medical",
                description: "Doctors serving communities",
              },
              {
                emoji: "👨‍🔬",
                title: "Engineering",
                description: "Engineers driving innovation",
              },
              {
                emoji: "👨‍🏫",
                title: "Education",
                description: "Teachers shaping futures",
              },
              {
                emoji: "💼",
                title: "Corporate",
                description: "Business leaders",
              },
              {
                emoji: "🚀",
                title: "Entrepreneurs",
                description: "Visionary builders",
              },
              {
                emoji: "🎨",
                title: "Arts",
                description: "Cultural contributors",
              },
            ].map((prof, i) => (
              <ProfCard key={i} {...prof} delay={i * 0.08} />
            ))}
          </Grid>
        </Card>
      </Section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-6 md:mb-8 flex items-center justify-center shadow-2xl">
            <span className="text-4xl md:text-5xl font-bold">C</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 md:mb-5">
            Chenanda Family
          </h3>
          <p className="text-gray-300 text-lg md:text-xl mb-6 md:mb-8">
            Preserving heritage, celebrating unity, inspiring generations
          </p>
          <p className="text-green-400 font-semibold text-lg md:text-xl">
            Proud hosts of Kodava Hockey Festival 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChenandaAbout;