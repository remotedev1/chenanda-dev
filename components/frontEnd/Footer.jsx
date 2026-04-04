"use client";
import React, { useState, useMemo, memo, useCallback } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { InstagramLogoIcon } from "@radix-ui/react-icons";

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
      <a href={social.url} target="_blank" rel="noopener noreferrer">
        {social.icon}
      </a>
    </m.div>
  );
});

SocialIcon.displayName = "SocialIcon";

// Memoized Link Component
const FooterLink = memo(({ link, name }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.li
      whileHover={shouldReduceMotion ? {} : { x: 10 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={link}
        className="text-gray-400 hover:text-yellow-400 transition-colors text-sm :md:text-xl"
      >
        {name}
      </Link>
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
      <h3 className="text-lg md:text-xl font-semibold mb-4 text-red-500 relative inline-block">
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
      tournament: [{ name: "About ", link: "/about-tournament" }],
      other: [
        { name: "About Us", link: "/about-us" },
        { name: "Gallery", link: "/gallery" },
        { name: "Contact", link: "#contact" },
        { name: "Policies", link: "/policies" },
        { name: "Terms&conditions", link: "/terms-and-conditions" },
      ],
    }),
    [],
  );

  const socialIcons = useMemo(
    () => [
      // { name: "Facebook", icon: "f" },
      // { name: "Twitter", icon: "𝕏" },
      {
        name: "Instagram",
        icon: <InstagramLogoIcon className="text-pink-500" />,
        url: "https://www.instagram.com/chenanda_hockey_2026?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      },
      // { name: "YouTube", icon: "▶" },
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
              className="w-full flex justify-between flex-col md:flex-row gap-10"
            >
              {/* Brand Section */}
              <m.div variants={itemVariants}>
                <div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
                    CHENANDA
                  </h2>
                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.62rem",
                      color: "#9e8c72",
                      letterSpacing: "0.08em",
                      margin: 0,
                      paddingBottom: "10px",
                    }}
                  >
                    KOKERI VILLAGE, CHEYYANDANE POST, KODAGU, KARNATAKA 571212
                  </p>
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
                </div>
              </m.div>
              <div className="flex space-x-8">
                {/* Company Links */}
                <FooterSection title="OTHER" delay={0.4}>
                  <ul className="space-y-2">
                    {footerLinks.other.map(({ link, name }) => (
                      <FooterLink key={link} link={link} name={name} />
                    ))}
                  </ul>
                </FooterSection>
                {/* Tournament Links */}
                <FooterSection title="TOURNAMENTS" delay={0.3}>
                  <ul className="space-y-3">
                    {footerLinks.tournament.map(({ link, name }) => (
                      <FooterLink key={link} link={link} name={name} />
                    ))}
                  </ul>
                </FooterSection>
              </div>
            </m.div>

            {/* Bottom Bar */}
            <m.div
              className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center mt-4"
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
