"use client";

import React from "react";
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
  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Reusable Components
  const Section = ({ id, children, className = "", gradient = "" }) => (
    <section
      id={id}
      className={`py-20 px-4 relative overflow-hidden ${gradient} ${className}`}
    >
      <div className="max-w-6xl mx-auto relative z-10">{children}</div>
    </section>
  );

  const SectionHeader = ({ icon: Icon, title, subtitle, light = false }) => (
    <motion.div
      className="text-center mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      <motion.div
        className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl ${
          light
            ? "bg-emerald-500"
            : "bg-gradient-to-br from-green-600 to-emerald-600"
        }`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon className="w-10 h-10 text-white" />
      </motion.div>
      <h2
        className={`text-5xl font-bold mb-3 ${
          light ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xl ${light ? "text-green-100" : "text-gray-600"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );

  const Card = ({ children, delay = 0, className = "" }) => (
    <motion.div
      className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInScale}
      transition={{ delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );

  const GradientCard = ({ children, className = "" }) => (
    <motion.div
      className={`rounded-2xl shadow-2xl p-10 ${className}`}
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
      className={`grid md:grid-cols-${cols} gap-8`}
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
      <motion.div
        className="text-6xl mb-5"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {emoji}
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </Card>
  );

  const ListItem = ({ icon, title, subtitle, delay = 0 }) => (
    <motion.div
      className="flex items-start space-x-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={slideInRight}
      transition={{ delay }}
      whileHover={{ x: 10, scale: 1.02, backgroundColor: "rgb(236 253 245)" }}
    >
      <span className="text-4xl">{icon}</span>
      <div>
        <h4 className="font-bold text-xl text-gray-800">{title}</h4>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </motion.div>
  );

  const Badge = ({ icon, text, delay = 0 }) => (
    <motion.div
      className="flex items-center space-x-3 p-5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl cursor-pointer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInScale}
      transition={{ delay }}
      whileHover={{ scale: 1.05, rotate: 2 }}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-lg font-semibold text-gray-800">{text}</span>
    </motion.div>
  );

  const ProfCard = ({ emoji, title, description, delay = 0 }) => (
    <motion.div
      className="p-7 bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-200 shadow-lg"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay }}
      whileHover={{
        y: -12,
        borderColor: "rgb(34 197 94)",
        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)",
      }}
    >
      <div className="text-5xl mb-4">{emoji}</div>
      <h4 className="text-xl font-bold mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 text-white overflow-hidden">
        {/* Animated Leaves Background */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-300 opacity-20"
              initial={{ y: -100, x: Math.random() * window.innerWidth }}
              animate={{
                y: window.innerHeight + 100,
                x: Math.random() * window.innerWidth,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            >
              <Leaf size={40} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
          >
            <motion.div
              className="w-40 h-40 bg-white rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-7xl font-bold bg-gradient-to-br from-green-700 to-emerald-600 bg-clip-text text-transparent">
                C
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-7xl md:text-8xl font-bold mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Chenanda Family
          </motion.h1>

          <motion.p
            className="text-3xl md:text-4xl mb-5 text-green-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Preserving Heritage, Celebrating Unity
          </motion.p>

          <motion.p
            className="text-xl md:text-2xl text-green-200 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            First Kodava family to ideate, create, and register an official
            family logo
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="inline-block bg-white/20 backdrop-blur-md px-10 py-6 rounded-2xl border-2 border-white/40 shadow-2xl">
              <p className="text-2xl font-semibold">Proud Hosts of</p>
              <p className="text-4xl font-bold text-green-300 mt-2">
                Kodava Hockey Festival 2026
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-10 h-10 text-white opacity-80" />
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

        <GradientCard className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white mt-16">
          <h3 className="text-4xl font-bold mb-8">The Chenanda Logo</h3>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <p className="text-xl mb-5 leading-relaxed">
                In a historic first, the Chenanda family became the pioneering
                Kodava family to ideate, create, and officially register a
                family logo.
              </p>
              <p className="text-xl mb-5 leading-relaxed">
                This emblem represents our collective identity, values, and the
                unbreakable bond that ties generations together.
              </p>
              <p className="text-green-200 font-semibold text-lg">
                Symbolism: Unity, Heritage, and Progress
              </p>
            </motion.div>
            <motion.div
              className="bg-white/20 backdrop-blur-md rounded-2xl p-10 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
            >
              <motion.div
                className="w-56 h-56 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <span className="text-8xl font-bold bg-gradient-to-br from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  C
                </span>
              </motion.div>
              <p className="mt-6 text-green-100 text-lg">
                Official Family Logo
              </p>
            </motion.div>
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
              <h3 className="text-3xl font-bold text-green-800 mb-4">
                {item.emoji} {item.title}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
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
        <div className="space-y-8">
          <GradientCard className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100">
            <h3 className="text-4xl font-bold text-green-800 mb-5">
              🏰 Medieval History
            </h3>
            <p className="text-gray-800 text-xl leading-relaxed">
              Our family&apos;s roots trace back to significant land ownership,
              strategic alliances, and contributions during medieval times.
            </p>
          </GradientCard>

          <GradientCard className="bg-gradient-to-r from-teal-100 via-emerald-100 to-green-100">
            <h3 className="text-4xl font-bold text-green-800 mb-5">
              🙏 Guru Karona Lineage
            </h3>
            <p className="text-gray-800 text-xl leading-relaxed">
              Our ancestral practices and traditions are deeply rooted in the
              Guru Karona lineage, shaping our spiritual identity.
            </p>
          </GradientCard>

          <Card>
            <h3 className="text-4xl font-bold text-green-800 mb-8">
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
            <Mountain className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">📅 Family Tree</h3>
            <p className="text-xl mb-3">
              To be published post 9th May (if permitted)
            </p>
            <p className="text-green-200 text-lg">
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
        <Card className="mb-12">
          <h3 className="text-3xl font-bold text-green-800 mb-8">
            🎊 Regular Gatherings
          </h3>
          <div className="space-y-5">
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
            <h3 className="text-3xl font-bold mb-6">
              🎊 Traditional Festivals
            </h3>
            <motion.ul
              className="space-y-4 text-xl"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {["Changrandi", "Kail Podh", "Puthari"].map((f, i) => (
                <motion.li
                  key={i}
                  variants={fadeInUp}
                  className="flex items-center space-x-3"
                >
                  <span className="text-green-300">✦</span>
                  <span>{f}</span>
                </motion.li>
              ))}
            </motion.ul>
          </GradientCard>

          <Card>
            <h3 className="text-3xl font-bold text-green-800 mb-5">
              💰 Family Fund
            </h3>
            <p className="text-gray-700 text-xl leading-relaxed">
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
            <motion.div
              key={i}
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: i * 0.1 }}
              whileHover={{
                y: -8,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              }}
            >
              <h3 className="text-3xl font-bold text-green-300 mb-4">
                {item.emoji} {item.title}
              </h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                {item.description}
              </p>
            </motion.div>
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

        <GradientCard className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white mb-12">
          <div className="flex items-center space-x-5 mb-8">
            <Trophy className="w-14 h-14" />
            <h3 className="text-4xl font-bold">Sports Excellence</h3>
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
              <motion.div
                key={i}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-7"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInScale}
                transition={{ delay: i * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                }}
              >
                <h4 className="text-2xl font-bold mb-3 text-cyan-200">
                  {item.emoji} {item.title}
                </h4>
                <p className="text-gray-200 text-lg">{item.description}</p>
              </motion.div>
            ))}
          </Grid>
        </GradientCard>

        <GradientCard className="bg-gradient-to-br from-green-600 via-emerald-700 to-teal-700 text-white mb-12">
          <div className="flex items-center space-x-5 mb-8">
            <Shield className="w-14 h-14" />
            <h3 className="text-4xl font-bold">Armed Forces</h3>
          </div>
          <p className="text-2xl mb-8 text-green-100">
            Proud tradition of military service across ranks
          </p>
          <motion.div
            className="bg-white/15 backdrop-blur-sm rounded-xl p-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h4 className="text-2xl font-bold mb-4 text-green-200">
              🎖️ Honours & Medals
            </h4>
            <p className="text-gray-200 text-xl leading-relaxed">
              Stories of courage, dedication, and distinguished service to the
              nation.
            </p>
          </motion.div>
        </GradientCard>

        <Card>
          <div className="flex items-center space-x-5 mb-10">
            <Briefcase className="w-14 h-14 text-green-700" />
            <h3 className="text-4xl font-bold text-gray-800">Professionals</h3>
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
      <footer className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white py-16 px-4">
        <motion.div
          className="max-w-6xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInScale}>
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-5xl font-bold">C</span>
            </motion.div>
          </motion.div>
          <motion.h3 variant s={fadeInUp} className="text-4xl font-bold mb-5">
            Chenanda Family
          </motion.h3>
          <motion.p variants={fadeInUp} className="text-gray-300 text-xl mb-8">
            Preserving heritage, celebrating unity, inspiring generations
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="text-green-400 font-semibold text-xl"
          >
            Proud hosts of Kodava Hockey Festival 2026
          </motion.p>
        </motion.div>
      </footer>
    </div>
  );
};

export default ChenandaAbout;
