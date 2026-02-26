"use client";
import Link from "next/link";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

// Memoized Scroll Indicator Component
const ScrollIndicator = memo(() => (
  <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
    <Link
      href="#about-us-section"
      className="flex flex-col justify-center items-center"
    >
      <p className="text-white text-sm mb-1 animate-pulse">Scroll down</p>
      <ChevronDown
        className="w-6 h-6 text-white animate-bounce"
        strokeWidth={2}
      />
    </Link>
  </div>
));

ScrollIndicator.displayName = "ScrollIndicator";

// Memoized Logo Component
const HeroLogo = memo(({ isMobile }) => {
  const shouldReduceMotion = useReducedMotion();

  const logoSize = useMemo(
    () => ({
      width: isMobile ? 230 : 300,
      height: isMobile ? 80 : 120,
    }),
    [isMobile],
  );

  return (
    <m.div
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, filter: "blur(10px)", scale: 0.8 }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, filter: "blur(0px)", scale: 1 }
      }
      transition={{ duration: shouldReduceMotion ? 0.3 : 1.2, ease: "easeOut" }}
      className="mb-6"
    >
      <Image
        src="/logo.png"
        alt="Chenanda Okka Logo"
        width={logoSize.width}
        height={logoSize.height}
        className="object-contain"
        priority={true}
      />
    </m.div>
  );
});

HeroLogo.displayName = "HeroLogo";

// Main Hero Component
export default function Hero() {
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const isMobile = useIsMobile();

  // Memoized intersection observer options
  const observerOptions = useMemo(
    () => ({
      threshold: 0.3,
      rootMargin: "0px 0px -10% 0px", // Trigger slightly earlier
    }),
    [],
  );

  // Setup intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsInView(entry.isIntersecting);
    }, observerOptions);

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
      observer.disconnect();
    };
  }, [observerOptions]);

  // Handle video playback (if you uncomment the video)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      video.play().catch((error) => {
        console.log("Video autoplay prevented:", error);
      });
    } else {
      video.pause();
    }
  }, [isInView]);

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        ref={sectionRef}
        className="relative w-full h-screen overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-poster.jpg)" }}
          role="img"
          aria-label="Hero background"
        />

        {/* Background Video - Uncomment if needed */}
        {/* <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="/videos/hero.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
        /> */}

        {/* Black Filter Overlay */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
          {/* Logo */}
          <HeroLogo isMobile={isMobile} />
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator />
      </section>
    </LazyMotion>
  );
}
