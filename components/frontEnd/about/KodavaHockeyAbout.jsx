"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  LazyMotion,
  domAnimation,
  useReducedMotion,
  useInView,
} from "framer-motion";

// Animated Counter Component
function AnimatedCounter({ end, suffix = "", duration = 2000 }) {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setCount(end);
      return;
    }

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isInView, shouldReduceMotion]);

  return (
    <span ref={ref} className="stat-number">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Hero Section Component
function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="hero-section">
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
   

        <motion.h1 variants={itemVariants} className="hero-title">
          The Kodava Hockey Festival
        </motion.h1>

        <motion.p variants={itemVariants} className="hero-subtitle">
          Where heritage meets the hockey field — celebrating unity, tradition,
          and the indomitable spirit of the Kodava community
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="hero-divider"
          aria-hidden="true"
        >
          <span className="divider-ornament"></span>
        </motion.div>
      </motion.div>
    </section>
  );
}

// About Section Component
function AboutSection() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.7,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="about-section section" ref={ref}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={variants}
      >
        <div className="about-header accent-border">
          <h2>About the Festival</h2>
        </div>

        <div className="about-content">
          <p className="lead-text">
            The Kodava Hockey Festival is not merely a sporting event—it is a
            living testament to the enduring spirit of the Kodava people. Born
            from a vision of unity and cultural preservation, this annual
            gathering has evolved into the world&apos;s largest hockey
            tournament, bringing together families from across the globe to
            celebrate their shared heritage on the sacred grounds of Kodagu.
          </p>

          <p>
            Every November, the verdant hills of Coorg transform into a stage
            where tradition and athleticism converge. What began as a modest
            family tournament has blossomed into a phenomenon that transcends
            sport—a pilgrimage for the Kodava diaspora, a showcase of
            resilience, and a bridge connecting generations through the
            universal language of hockey.
          </p>

          <p>
            This festival embodies the Kodava philosophy of collective strength,
            where competition serves not to divide but to unite. It is a space
            where ancestral values are passed down through the thrill of the
            game, where young players learn that victory lies not just in
            scoring goals but in honoring one&apos;s lineage and community.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

// Origins Section Component
function OriginsSection() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="origins-section section" ref={ref}>
      <motion.div
        className="origins-container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          variants={itemVariants}
          className="origins-header accent-border"
        >
          <h2>Origins & Vision</h2>
          <p className="section-intro">
            A dream rooted in community, nurtured by passion
          </p>
        </motion.div>

        <div className="timeline">
          <motion.div variants={itemVariants} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true">
              <span className="marker-dot"></span>
            </div>
            <div className="timeline-content">
              <h3 className="timeline-year">1997</h3>
              <h4>The Founding Vision</h4>
              <p>
                Pandanda Kuttappa, a visionary leader with deep reverence for
                Kodava culture, conceived the idea of a hockey tournament that
                would do more than showcase athletic prowess. He envisioned a
                gathering that would strengthen the bonds between Kodava
                families, preserve their unique identity, and provide a platform
                for the younger generation to connect with their roots.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true">
              <span className="marker-dot"></span>
            </div>
            <div className="timeline-content">
              <h4>The First Tournament</h4>
              <p>
                What began with 60 teams representing Kodava families quickly
                captured the imagination of the community. The tournament was
                held on modest grounds, yet the spirit was boundless. Families
                traveled from near and far, not just to compete, but to
                reconnect—to share meals, stories, and laughter under the Coorg
                sky.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true">
              <span className="marker-dot"></span>
            </div>
            <div className="timeline-content">
              <h4>Exponential Growth</h4>
              <p>
                Word spread like wildfire across the Kodava diaspora. Each year,
                more families registered, more players trained, and more
                spectators made the pilgrimage home. By the early 2000s, the
                festival had outgrown its original venue, necessitating
                infrastructure expansions and better organization. Yet, the soul
                of the event remained unchanged—family, heritage, and hockey.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="timeline-item">
            <div className="timeline-marker" aria-hidden="true">
              <span className="marker-dot"></span>
            </div>
            <div className="timeline-content">
              <h4>A Global Phenomenon</h4>
              <p>
                Today, the Kodava Hockey Festival stands as a symbol of what a
                community can achieve when it unites around shared values. It
                has inspired similar cultural festivals worldwide and serves as
                a model for preserving indigenous traditions through
                contemporary means. The festival&apos;s growth reflects the
                Kodava community&apos;s commitment to honoring their past while
                embracing the future.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Scale Section Component
function ScaleSection() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="scale-section section" ref={ref}>
      <motion.div
        className="scale-container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          variants={itemVariants}
          className="scale-header accent-border"
        >
          <h2>Scale, Records & Recognition</h2>
          <p className="section-intro">
            Numbers that tell a story of community
          </p>
        </motion.div>

        <div className="stats-grid">
          <motion.div variants={itemVariants} className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <AnimatedCounter end={220} suffix="+" />
            <p className="stat-label">Teams Competing</p>
            <p className="stat-description">
              Representing families from across the globe, each carrying their
              ancestral pride onto the field
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <AnimatedCounter end={3500} suffix="+" />
            <p className="stat-label">Players</p>
            <p className="stat-description">
              Athletes ranging from young hopefuls to seasoned veterans, united
              by heritage
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="stat-card">
            <div className="stat-icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            </div>
            <AnimatedCounter end={50000} suffix="+" />
            <p className="stat-label">Annual Footfall</p>
            <p className="stat-description">
              Spectators, families, and supporters creating an electrifying
              atmosphere of celebration
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="stat-card stat-card-highlight"
          >
            <div className="stat-icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div className="stat-number-wrapper">
              <span className="stat-number">World Records</span>
            </div>
            <p className="stat-label">Guinness & Limca Recognition</p>
            <p className="stat-description">
              Officially recognized as the largest hockey tournament in the
              world, cementing its place in sporting history
            </p>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="scale-note">
          <p>
            These numbers represent more than statistics—they embody the
            strength of a community that has preserved its identity across
            continents and generations. Each participant, whether player or
            spectator, contributes to a legacy that transcends sport.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Traditions Section Component
function TraditionsSection() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="traditions-section section" ref={ref}>
      <motion.div
        className="traditions-container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          variants={itemVariants}
          className="traditions-header accent-border"
        >
          <h2>Tournament Format & Traditions</h2>
          <p className="section-intro">
            Where ancient customs meet modern competition
          </p>
        </motion.div>

        <div className="traditions-grid">
          <motion.div variants={itemVariants} className="tradition-card">
            <div className="tradition-icon" aria-hidden="true">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Family-Based Teams</h3>
            <p>
              Each team represents a Kodava family lineage, with players drawn
              from extended family networks across the world. This structure
              transforms competition into a celebration of kinship, where
              victory honors not just skill but ancestral pride.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="tradition-card">
            <div className="tradition-icon" aria-hidden="true">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h3>The Hosting Tradition</h3>
            <p>
              Families take turns hosting the tournament, a responsibility
              steeped in honor and meticulous preparation. The host family
              oversees logistics, welcomes guests with traditional Kodava
              hospitality, and ensures the festival runs seamlessly.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="tradition-card">
            <div className="tradition-icon" aria-hidden="true">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3>The Torch Relay</h3>
            <p>
              Before the games commence, a ceremonial torch is lit and carried
              through Kodava villages, symbolizing the unity of the community
              and the passing of tradition from one generation to the next.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="tradition-card">
            <div className="tradition-icon" aria-hidden="true">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Tournament Structure</h3>
            <p>
              Played in a knockout format over multiple days, the tournament
              features round-robin group stages followed by elimination rounds.
              Matches are timed with precision, and adjudication adheres to
              international hockey standards.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="tradition-card tradition-card-highlight"
          >
            <div className="tradition-icon" aria-hidden="true">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Women&apos;s Category</h3>
            <p>
              Recognizing the vital role of Kodava women in preserving culture
              and strengthening community, the festival includes a dedicated
              women&apos;s tournament. Women players are celebrated as
              torchbearers of progress, embodying both tradition and modernity.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="tradition-card tradition-card-highlight"
          >
            <div className="tradition-icon" aria-hidden="true">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3>Fair Play & Respect</h3>
            <p>
              The festival upholds the highest standards of sportsmanship.
              Disputes are resolved through dialogue, with elders often
              mediating to ensure harmony. The tournament emphasizes that while
              competition is fierce, the bonds of community are paramount.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Culture Section Component
function CultureSection() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="culture-section section" ref={ref}>
      <motion.div
        className="culture-container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          variants={itemVariants}
          className="culture-header accent-border"
        >
          <h2>Culture Beyond the Field</h2>
          <p className="section-intro">
            A tapestry of tradition woven through celebration
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="culture-intro">
          <p>
            While hockey is the heart of the festival, the soul lies in the
            cultural experiences that surround it. The tournament becomes a
            vibrant cultural exposition, showcasing the richness of Kodava
            heritage in all its forms.
          </p>
        </motion.div>

        <div className="culture-grid">
          <motion.div variants={itemVariants} className="culture-item">
            <div className="culture-icon" aria-hidden="true">
              🎭
            </div>
            <h3>Cultural Performances</h3>
            <p>
              Evenings come alive with traditional Kodava dances such as
              Ummathat and Kolaat, performed by troupes in authentic attire.
              Folk songs echo across the grounds, narrating tales of valor,
              love, and harvest.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="culture-item">
            <div className="culture-icon" aria-hidden="true">
              🍛
            </div>
            <h3>Traditional Cuisine</h3>
            <p>
              Food stalls serve authentic Kodava delicacies—pandi curry,
              kadambuttu, nool puttu, and paputtu. Families share meals, passing
              down recipes and stories. The aroma of freshly ground spices
              reinforces the spirit of togetherness.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="culture-item">
            <div className="culture-icon" aria-hidden="true">
              👘
            </div>
            <h3>Traditional Attire</h3>
            <p>
              Participants proudly don traditional Kodava dress—men in kupya and
              chale, women in elegant sarees with distinctive jewelry. This
              sartorial pride transforms the tournament into a visual feast.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="culture-item">
            <div className="culture-icon" aria-hidden="true">
              🎨
            </div>
            <h3>Art & Craft Exhibitions</h3>
            <p>
              Local artisans display traditional Kodava crafts—carved wooden
              artifacts, handwoven textiles, and silver jewelry. These
              exhibitions provide economic opportunities while educating younger
              generations.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="culture-item">
            <div className="culture-icon" aria-hidden="true">
              📚
            </div>
            <h3>Storytelling & Oral Histories</h3>
            <p>
              Elders gather to share stories of ancestors, recounting legends of
              bravery, wisdom, and community. These sessions serve as informal
              education, ensuring younger Kodavas understand their roots.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="culture-item">
            <div className="culture-icon" aria-hidden="true">
              🤝
            </div>
            <h3>Community Gatherings</h3>
            <p>
              The festival facilitates countless informal reunions. Families
              separated by oceans reconnect, friendships are rekindled, and new
              bonds are forged. A homecoming, a pilgrimage back to one&apos;s
              origins.
            </p>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="culture-closing">
          <p>
            The Kodava Hockey Festival demonstrates that culture is not
            static—it thrives when communities actively engage with it. By
            embedding cultural celebration within a sporting event, the festival
            ensures that tradition remains relevant, dynamic, and cherished.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Impact Section Component
function ImpactSection() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.7,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="impact-section section" ref={ref}>
      <motion.div
        className="impact-container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          variants={itemVariants}
          className="impact-header accent-border"
        >
          <h2>Impact & Legacy</h2>
          <p className="section-intro">
            Building bridges across generations and continents
          </p>
        </motion.div>

        <div className="impact-content">
          <motion.div variants={itemVariants} className="impact-block">
            <h3>Talent Development</h3>
            <p>
              The festival has become a crucible for hockey talent. Young
              players who once competed on these grounds have gone on to
              represent India at national and international levels. The
              tournament provides exposure, experience, and inspiration.
            </p>
            <p>
              Scouts and coaches attend annually, identifying promising
              athletes. Yet, the festival&apos;s greatest contribution is in the
              thousands of young Kodavas who learn discipline, teamwork, and
              pride through participation.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="impact-block">
            <h3>Global Unity</h3>
            <p>
              The Kodava community is scattered across continents—from the
              coffee plantations of Coorg to tech hubs worldwide. The festival
              serves as an annual pilgrimage, a homecoming that transcends
              geography.
            </p>
            <p>
              For many diaspora Kodavas, this is their primary connection to
              their ancestral homeland. They return to immerse their children in
              Kodava culture, ensuring that distance does not erode identity.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="impact-block">
            <h3>Inspiring Indigenous Communities</h3>
            <p>
              The success of the Kodava Hockey Festival has inspired other
              indigenous and minority communities worldwide to use sport as a
              vehicle for cultural preservation. The festival&apos;s impact
              extends far beyond Kodagu, contributing to a global movement of
              cultural resilience.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="impact-quote">
            <blockquote>
              <p>
                &ldquo;The Kodava Hockey Festival is more than a tournament. It
                is a sanctuary where we remember who we are, where we come from,
                and what we stand for. It is our collective heartbeat, echoing
                across the hills of Coorg and reaching Kodavas wherever they may
                be.&rdquo;
              </p>
              <cite>— A sentiment shared by the community</cite>
            </blockquote>
          </motion.div>

          <motion.div variants={itemVariants} className="impact-closing">
            <p>
              As the festival continues to grow, its core mission remains
              unchanged: to celebrate Kodava heritage, strengthen community
              bonds, and provide a space where tradition and modernity dance in
              harmony.
            </p>
            <p className="final-line">
              Here, on the hockey fields of Coorg, the past and future meet—and
              the spirit of the Kodava people lives on.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Main About Page Component
export default function KodavaHockeyAbout() {
  return (
    <LazyMotion features={domAnimation}>
      <main className="about-tournament mt-10">
        <HeroSection />
        <AboutSection />
        <OriginsSection />
        <ScaleSection />
        <TraditionsSection />
        <CultureSection />
        <ImpactSection />

        <style jsx global>{`
          /* Hero Section */
          .hero-section {
            min-height: 85vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(
              135deg,
              var(--color-cream) 0%,
              var(--color-sand) 100%
            );
            position: relative;
            overflow: hidden;
            padding: var(--space-xl) var(--space-md);
          }

          .hero-section::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              var(--color-maroon) 20%,
              var(--color-yellow) 50%,
              var(--color-maroon) 80%,
              transparent
            );
          }

          .hero-content {
            text-align: center;
            max-width: 900px;
            position: relative;
            z-index: 1;
          }

          .hero-emblem {
            margin-bottom: var(--space-md);
            color: var(--color-maroon);
          }

          .hero-title {
            font-size: clamp(2.5rem, 8vw, 4.5rem);
            font-weight: 700;
            color: var(--color-blue);
            margin-bottom: var(--space-md);
            letter-spacing: -0.02em;
            line-height: 1.1;
          }

          .hero-subtitle {
            font-size: clamp(1.125rem, 3vw, 1.5rem);
            color: var(--color-slate);
            max-width: 700px;
            margin: 0 auto var(--space-lg);
            font-weight: 400;
            line-height: 1.6;
          }

          .hero-divider {
            margin-top: var(--space-xl);
            display: flex;
            justify-content: center;
          }

          .divider-ornament {
            width: 120px;
            height: 3px;
            background: linear-gradient(
              90deg,
              transparent,
              var(--color-yellow),
              transparent
            );
            border-radius: 2px;
          }

          /* About Section */
          .about-section {
            background: var(--color-cream);
            padding-top: var(--space-xl);
            padding-bottom: var(--space-2xl);
          }

          .about-header {
            margin-bottom: var(--space-xl);
            padding-top: var(--space-md);
          }

          .about-header h2 {
            font-size: var(--text-2xl);
            color: var(--color-blue);
            margin-bottom: var(--space-sm);
          }

          .about-content {
            max-width: var(--content-width);
            margin: 0 auto;
          }

          .lead-text {
            font-size: var(--text-lg);
            font-weight: 400;
            color: var(--color-blue);
            margin-bottom: var(--space-lg);
            line-height: 1.7;
          }

          .about-content p {
            color: var(--color-slate);
            margin-bottom: var(--space-md);
          }

          /* Origins Section */
          .origins-section {
            background: linear-gradient(
              to bottom,
              var(--color-cream) 0%,
              var(--color-sand) 100%
            );
            padding-top: var(--space-2xl);
            padding-bottom: var(--space-2xl);
          }

          .origins-header {
            text-align: center;
            margin-bottom: var(--space-xl);
            padding-top: var(--space-md);
          }

          .origins-header::before {
            left: 50%;
            transform: translateX(-50%);
          }

          .section-intro {
            font-size: var(--text-lg);
            color: var(--color-maroon);
            font-style: italic;
            font-family: var(--font-display);
          }

          .timeline {
            max-width: var(--content-width);
            margin: 0 auto;
            position: relative;
            padding-left: var(--space-lg);
          }

          .timeline::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(
              to bottom,
              var(--color-yellow),
              var(--color-maroon)
            );
          }

          .timeline-item {
            position: relative;
            margin-bottom: var(--space-xl);
          }

          .timeline-marker {
            position: absolute;
            left: calc(-1 * var(--space-lg));
            top: 0;
          }

          .marker-dot {
            display: block;
            width: 16px;
            height: 16px;
            background: var(--color-yellow);
            border: 3px solid var(--color-blue);
            border-radius: 50%;
            transform: translateX(-7px);
          }

          .timeline-content {
            background: white;
            padding: var(--space-md);
            border-left: 3px solid var(--color-maroon);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .timeline-year {
            font-size: var(--text-xl);
            color: var(--color-maroon);
            margin-bottom: var(--space-xs);
            font-weight: 700;
          }

          .timeline-content h4 {
            font-size: var(--text-lg);
            color: var(--color-blue);
            margin-bottom: var(--space-sm);
          }

          .timeline-content p {
            color: var(--color-slate);
            line-height: 1.7;
            margin: 0;
          }

          /* Scale Section */
          .scale-section {
            background: var(--color-cream);
            padding-top: var(--space-2xl);
            padding-bottom: var(--space-2xl);
          }

          .scale-header {
            text-align: center;
            margin-bottom: var(--space-xl);
            padding-top: var(--space-md);
          }

          .scale-header::before {
            left: 50%;
            transform: translateX(-50%);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: var(--space-md);
            margin-bottom: var(--space-xl);
          }

          .stat-card {
            background: white;
            padding: var(--space-lg);
            border-radius: 4px;
            border-top: 4px solid var(--color-blue);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            transition: transform var(--duration-base) var(--ease-smooth);
          }

          .stat-card:hover {
            transform: translateY(-4px);
          }

          .stat-card-highlight {
            border-top-color: var(--color-maroon);
            background: linear-gradient(
              135deg,
              white 0%,
              var(--color-sand) 100%
            );
          }

          .stat-icon {
            color: var(--color-yellow-dark);
            margin-bottom: var(--space-md);
          }

          .stat-number {
            display: block;
            font-size: var(--text-2xl);
            font-weight: 700;
            color: var(--color-blue);
            font-family: var(--font-display);
            margin-bottom: var(--space-sm);
          }

          .stat-label {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--color-maroon);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: var(--space-sm);
          }

          .stat-description {
            font-size: var(--text-xs);
            color: var(--color-slate);
            line-height: 1.6;
            margin: 0;
          }

          .scale-note {
            max-width: var(--content-width);
            margin: var(--space-xl) auto 0;
            padding: var(--space-md);
            background: var(--color-sand);
            border-left: 4px solid var(--color-yellow);
          }

          .scale-note p {
            margin: 0;
            font-style: italic;
            color: var(--color-blue);
          }

          /* Traditions Section */
          .traditions-section {
            background: linear-gradient(
              to bottom,
              var(--color-sand) 0%,
              var(--color-cream) 100%
            );
            padding-top: var(--space-2xl);
            padding-bottom: var(--space-2xl);
          }

          .traditions-header {
            text-align: center;
            margin-bottom: var(--space-xl);
            padding-top: var(--space-md);
          }

          .traditions-header::before {
            left: 50%;
            transform: translateX(-50%);
          }

          .traditions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: var(--space-md);
            max-width: 1000px;
            margin: 0 auto;
          }

          .tradition-card {
            background: white;
            padding: var(--space-lg);
            border-radius: 2px;
            border: 1px solid var(--color-sand);
            transition: all var(--duration-base) var(--ease-smooth);
          }

          .tradition-card:hover {
            border-color: var(--color-blue);
            box-shadow: 0 4px 16px rgba(26, 59, 93, 0.1);
          }

          .tradition-card-highlight {
            background: linear-gradient(
              135deg,
              white 0%,
              var(--color-sand) 100%
            );
            border-color: var(--color-maroon);
          }

          .tradition-icon {
            color: var(--color-yellow-dark);
            margin-bottom: var(--space-md);
          }

          .tradition-card h3 {
            font-size: var(--text-lg);
            color: var(--color-blue);
            margin-bottom: var(--space-sm);
          }

          .tradition-card p {
            font-size: var(--text-sm);
            color: var(--color-slate);
            line-height: 1.7;
            margin: 0;
          }

          /* Culture Section */
          .culture-section {
            background: var(--color-cream);
            padding-top: var(--space-2xl);
            padding-bottom: var(--space-2xl);
          }

          .culture-header {
            text-align: center;
            margin-bottom: var(--space-lg);
            padding-top: var(--space-md);
          }

          .culture-header::before {
            left: 50%;
            transform: translateX(-50%);
          }

          .culture-intro {
            max-width: var(--content-width);
            margin: 0 auto var(--space-xl);
            text-align: center;
          }

          .culture-intro p {
            color: var(--color-slate);
            font-size: var(--text-base);
          }

          .culture-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-md);
            max-width: 1000px;
            margin: 0 auto var(--space-xl);
          }

          .culture-item {
            background: white;
            padding: var(--space-lg);
            border: 1px solid var(--color-sand);
            border-radius: 2px;
            transition: all var(--duration-base) var(--ease-smooth);
          }

          .culture-item:hover {
            border-color: var(--color-yellow-dark);
            box-shadow: 0 4px 12px rgba(244, 196, 48, 0.15);
            transform: translateY(-2px);
          }

          .culture-icon {
            font-size: 2.5rem;
            margin-bottom: var(--space-sm);
            display: block;
          }

          .culture-item h3 {
            font-size: var(--text-lg);
            color: var(--color-blue);
            margin-bottom: var(--space-sm);
          }

          .culture-item p {
            font-size: var(--text-sm);
            color: var(--color-slate);
            line-height: 1.7;
            margin: 0;
          }

          .culture-closing {
            max-width: var(--content-width);
            margin: 0 auto;
            padding: var(--space-lg);
            background: var(--color-sand);
            border-left: 4px solid var(--color-blue);
          }

          .culture-closing p {
            margin: 0;
            font-size: var(--text-base);
            color: var(--color-blue);
            line-height: 1.7;
          }

          /* Impact Section */
          .impact-section {
            background: linear-gradient(
              to bottom,
              var(--color-sand) 0%,
              var(--color-blue-dark) 100%
            );
            padding-top: var(--space-2xl);
            padding-bottom: var(--space-2xl);
            position: relative;
          }

          .impact-section::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              var(--color-yellow) 50%,
              transparent
            );
          }

          .impact-header {
            text-align: center;
            margin-bottom: var(--space-xl);
            padding-top: var(--space-md);
          }

          .impact-header::before {
            left: 50%;
            transform: translateX(-50%);
          }

          .impact-content {
            max-width: var(--content-width);
            margin: 0 auto;
          }

          .impact-block {
            margin-bottom: var(--space-xl);
            padding: var(--space-lg);
            background: rgba(255, 255, 255, 0.95);
            border-radius: 2px;
          }

          .impact-block h3 {
            font-size: var(--text-xl);
            color: var(--color-blue);
            margin-bottom: var(--space-md);
          }

          .impact-block p {
            color: var(--color-slate);
            margin-bottom: var(--space-md);
          }

          .impact-quote {
            margin: var(--space-2xl) 0;
            padding: var(--space-xl) var(--space-lg);
            background: linear-gradient(
              135deg,
              var(--color-maroon-dark) 0%,
              var(--color-blue-dark) 100%
            );
            border-left: 4px solid var(--color-yellow);
          }

          .impact-quote blockquote {
            margin: 0;
          }

          .impact-quote p {
            font-size: var(--text-lg);
            font-style: italic;
            color: var(--color-cream);
            line-height: 1.7;
            margin-bottom: var(--space-md);
            font-family: var(--font-display);
          }

          .impact-quote cite {
            display: block;
            font-size: var(--text-sm);
            color: var(--color-yellow);
            font-style: normal;
            text-align: right;
          }

          .impact-closing {
            padding: var(--space-xl) var(--space-lg);
            background: rgba(255, 255, 255, 0.95);
            border-radius: 2px;
            text-align: center;
          }

          .impact-closing p {
            color: var(--color-slate);
            margin-bottom: var(--space-md);
          }

          .final-line {
            font-size: var(--text-lg);
            font-weight: 500;
            color: var(--color-blue) !important;
            font-family: var(--font-display);
            margin-bottom: 0 !important;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .hero-section {
              min-height: 70vh;
              padding: var(--space-lg) var(--space-md);
            }

            .about-section,
            .origins-section,
            .scale-section,
            .traditions-section,
            .culture-section,
            .impact-section {
              padding-top: var(--space-lg);
              padding-bottom: var(--space-md);
            }

            .timeline {
              padding-left: var(--space-md);
            }

            .timeline-marker {
              left: calc(-1 * var(--space-md));
            }

            .stats-grid,
            .traditions-grid,
            .culture-grid {
              grid-template-columns: 1fr;
            }

            .stat-card,
            .tradition-card,
            .culture-item {
              padding: var(--space-md);
            }

            .impact-block,
            .impact-quote,
            .impact-closing {
              padding: var(--space-md);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .stat-card:hover,
            .tradition-card:hover,
            .culture-item:hover {
              transform: none;
            }
          }
        `}</style>
      </main>
    </LazyMotion>
  );
}
