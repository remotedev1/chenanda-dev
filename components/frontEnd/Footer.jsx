"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const SportsFooter = () => {
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const footerLinks = {
    sports: [
      "Basketball",
      "Football",
      "Soccer",
      "Tennis",
      "Baseball",
      "Hockey",
    ],
    company: ["About Us", "Careers", "Press", "Partners", "Contact"],
    resources: ["Blog", "Newsletter", "Events", "Help Center", "Support"],
  };

  const socialIcons = [
    { name: "Facebook", icon: "f" },
    { name: "Twitter", icon: "𝕏" },
    { name: "Instagram", icon: "📷" },
    { name: "YouTube", icon: "▶" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const ballVariants = {
    float: {
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-indigo-700 flex flex-col ">
      {/* Demo Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * -200],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center text-white max-w-4xl">
          {/* Top Badge */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
           

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                  }}
                  animate={{
                    y: [null, Math.random() * -200],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center text-white max-w-4xl">
              {/* Top Advertisement */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/40 mb-6"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Advertisement Space Available
                </span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>

              {/* Main Title with Stagger Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
                  <motion.span
                    className="inline-block"
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(255,255,255,0.5)",
                        "0 0 40px rgba(255,255,255,0.8)",
                        "0 0 20px rgba(255,255,255,0.5)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    YOUR BRAND
                  </motion.span>{" "}
                  <motion.span
                    className="inline-block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ backgroundSize: "200% auto" }}
                  >
                    COULD BE HERE
                  </motion.span>
                </h1>
              </motion.div>

              {/* Description */}
              <p
                className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 font-medium max-w-2xl mx-auto px-4"
              >
                Reach thousands of passionate sports fans and athletes. Premium
                advertising space now available for sponsors and partners.
              </p>
            </div>

          
          </div>
        </div>

        {/* Corner Accents */}
        <motion.div
          className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Footer Section */}
      <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
        {/* Animated SVG Background */}
        <div className="absolute inset-0 opacity-10">
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
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-24"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,0 C300,100 600,0 900,50 C1100,80 1200,0 1200,0 L1200,120 L0,120 Z"
              fill="rgba(255,107,107,0.1)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
          >
            {/* Brand Section */}
            <motion.div variants={itemVariants}>
              <h2
                className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent"
              >
                CHENANDA
              </h2>

              <div className="flex gap-3">
                {socialIcons.map((social, idx) => (
                  <motion.div
                    key={social.name}
                    className="w-12 h-12 bg-white bg-opacity-10 rounded-full flex items-center justify-center cursor-pointer text-xl"
                    whileHover={{
                      scale: 1.2,
                      rotate: 360,
                      backgroundColor: "rgba(239, 68, 68, 0.8)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onHoverStart={() => setHoveredSocial(idx)}
                    onHoverEnd={() => setHoveredSocial(null)}
                  >
                    {social.icon}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sports Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-4 text-red-500 relative inline-block">
                SPORTS
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </h3>
              <ul className="space-y-3">
                {footerLinks.sports.map((link, idx) => (
                  <motion.li
                    key={link}
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-4 text-red-500 relative inline-block">
                COMPANY
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, idx) => (
                  <motion.li
                    key={link}
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold mb-4 text-red-500 relative inline-block">
                NEWSLETTER
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                />
              </h3>
              <p className="text-gray-400 mb-4">
                Get the latest sports updates delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-white bg-opacity-10 border border-gray-700 rounded-full focus:outline-none focus:border-red-500 transition-colors"
                />
                <motion.button
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full font-semibold text-slate-900"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2026 Chennada okka. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="text-gray-500 hover:text-yellow-400 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    {item}
                  </motion.a>
                )
              )}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default SportsFooter;
