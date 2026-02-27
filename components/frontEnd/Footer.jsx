"use client";
import React, { useState, useMemo, memo, useCallback } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

// Memoized Social Icon Component
const SocialIcon = memo(({ social, index, onHover }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className="w-12 h-12 bg-white bg-opacity-10 rounded-full flex items-center justify-center cursor-pointer text-xl"
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.2,
              rotate: 360,
              backgroundColor: "rgba(239, 68, 68, 0.8)",
            }
      }
      whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => onHover(index)}
      onHoverEnd={() => onHover(null)}
    >
      {social.icon}
    </m.div>
  );
});

SocialIcon.displayName = "SocialIcon";

// Memoized Link Component
const FooterLink = memo(({ link }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.li
      whileHover={shouldReduceMotion ? {} : { x: 10 }}
      transition={{ duration: 0.2 }}
    >
      <a
        href="#"
        className="text-gray-400 hover:text-yellow-400 transition-colors"
      >
        {link}
      </a>
    </m.li>
  );
});

FooterLink.displayName = "FooterLink";

// Memoized Section Component
const FooterSection = memo(({ title, children, delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = useMemo(
    () => ({
      hidden: { y: shouldReduceMotion ? 0 : 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: shouldReduceMotion ? 0 : 0.5 },
      },
    }),
    [shouldReduceMotion],
  );

  return (
    <m.div variants={itemVariants}>
      <h3 className="text-xl font-semibold mb-4 text-red-500 relative inline-block">
        {title}
        <m.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500"
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay }}
          viewport={{ once: true, amount: 0.3 }}
        />
      </h3>
      {children}
    </m.div>
  );
});

FooterSection.displayName = "FooterSection";

// Main Footer Component
const SportsFooter = () => {
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  // Memoize static data
  const footerLinks = useMemo(
    () => ({
      sports: ["Hockey"],
      company: ["About Us", "Contact"],
    }),
    [],
  );

  const socialIcons = useMemo(
    () => [
      { name: "Facebook", icon: "f" },
      { name: "Twitter", icon: "𝕏" },
      { name: "Instagram", icon: "📷" },
      { name: "YouTube", icon: "▶" },
    ],
    [],
  );

  // Memoize animation variants
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.1,
        },
      },
    }),
    [shouldReduceMotion],
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { y: shouldReduceMotion ? 0 : 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: shouldReduceMotion ? 0 : 0.5 },
      },
    }),
    [shouldReduceMotion],
  );

  // Memoize callbacks
  const handleSocialHover = useCallback((index) => {
    setHoveredSocial(index);
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="bg-indigo-700 flex flex-col">
        {/* Footer Section */}
        <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
          {/* Animated SVG Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Animated Wave SVG */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
            <svg
              className="relative block w-full h-24"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <m.path
                d="M0,0 C300,100 600,0 900,50 C1100,80 1200,0 1200,0 L1200,120 L0,120 Z"
                fill="rgba(255,107,107,0.1)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: shouldReduceMotion ? 1 : 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 2,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
            <m.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
                margin: "0px 0px -50px 0px",
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
            >
              {/* Brand Section */}
              <m.div variants={itemVariants}>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
                  CHENANDA
                </h2>

                <div className="flex gap-3">
                  {socialIcons.map((social, idx) => (
                    <SocialIcon
                      key={social.name}
                      social={social}
                      index={idx}
                      onHover={handleSocialHover}
                    />
                  ))}
                </div>
              </m.div>

              {/* Sports Links */}
              <FooterSection title="SPORTS" delay={0.3}>
                <ul className="space-y-3">
                  {footerLinks.sports.map((link) => (
                    <FooterLink key={link} link={link} />
                  ))}
                </ul>
              </FooterSection>

              {/* Company Links */}
              <FooterSection title="COMPANY" delay={0.4}>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <FooterLink key={link} link={link} />
                  ))}
                </ul>
              </FooterSection>

             
            </m.div>

            {/* Bottom Bar */}
            <m.div
              className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.5 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                © 2026 Chennada okka. All rights reserved.
              </p>
            </m.div>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
};

export default memo(SportsFooter);
