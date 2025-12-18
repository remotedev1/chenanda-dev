"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

export default function Hero() {
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero-poster.jpg)" }}
      />

      {/* Background Video */}
      {/* <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/videos/hero.mp4"
        muted
        loop
        playsInline
        preload="auto"
      /> */}

      {/* Black Filter Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", scale: 0.8 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-6"
        >
          <Image
            src="/logo.png"
            alt="Chenanda Okka Logo"
            width={isMobile ? 230 : 300}
            height={isMobile ? 80 : 120}
            className="object-contain"
            priority={true}
          />
        </motion.div>

        {/* Button */}

        <motion.button
          className="px-8 py-4  rounded-2xl shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/about-us"
            className="bg-yellow-500 rounded-full text-black text-base px-8 py-3 hover:bg-yellow-300 transition-colors"
          >
            About Us
          </Link>
        </motion.button>
      </div>
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <p className="text-white text-sm mb-1 animate-pulse">Scroll down</p>
        <ChevronDown
          className="w-6 h-6 text-white animate-bounce"
          strokeWidth={2}
        />
      </div>
    </section>
  );
}
