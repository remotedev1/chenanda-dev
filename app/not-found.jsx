"use client";

import React, { useEffect, useState } from "react";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: "transform 0.5s ease-out",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            transition: "transform 0.5s ease-out",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(calc(-50% + ${mousePosition.x * 0.5}px), calc(-50% + ${mousePosition.y * 0.5}px))`,
            transition: "transform 0.5s ease-out",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Floating decorative elements */}
        <div className="absolute top-32 left-1/4 animate-float-slow">
          <div
            className="w-16 h-16 rounded-2xl bg-rose-300/40 backdrop-blur-sm rotate-12"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
        <div className="absolute bottom-32 right-1/4 animate-float-slow">
          <div
            className="w-20 h-20 rounded-full bg-amber-300/40 backdrop-blur-sm"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
        <div className="absolute top-1/4 right-1/3 animate-float-slow">
          <div
            className="w-12 h-12 rounded-xl bg-orange-300/40 backdrop-blur-sm -rotate-12"
            style={{ animationDelay: "2.5s" }}
          />
        </div>

        {/* Error code with stagger animation */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1
            className="text-9xl md:text-[12rem] font-bold mb-4 leading-none tracking-tight"
            style={{
              fontFamily: "'Fraunces', serif",
              background:
                "linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 40px rgba(251, 146, 60, 0.3)",
            }}
          >
            404
          </h1>
        </div>

        {/* Message */}
        <div
          className="text-center max-w-2xl mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2
            className="text-4xl md:text-5xl font-semibold mb-6 text-rose-900"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Oops! Page Not Found
          </h2>
          <p
            className="text-lg md:text-xl text-rose-800/80 leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Looks like you&apos;ve wandered into uncharted territory. The page
            you&apos;re looking for seems to have floated away like a balloon in
            the wind.
          </p>
        </div>

        {/* Illustration - Abstract floating elements */}
        <div
          className="relative w-64 h-64 mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center circle */}
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 animate-pulse-slow shadow-2xl shadow-rose-300/50" />

            {/* Orbiting elements */}
            <div className="absolute w-full h-full animate-spin-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl shadow-amber-300/50" />
            </div>
            <div className="absolute w-full h-full animate-spin-slow-reverse">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 shadow-xl shadow-rose-300/50" />
            </div>
            <div className="absolute w-full h-full animate-spin-medium">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 shadow-xl shadow-orange-300/50" />
            </div>
            <div className="absolute w-full h-full animate-spin-medium-reverse">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 shadow-xl shadow-pink-300/50" />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <button
            onClick={() => (window.location.href = "/")}
            className="group relative px-12 py-5 rounded-full font-semibold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 transition-transform duration-300 group-hover:scale-110" />

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

            {/* Button text */}
            <span className="relative flex items-center gap-3">
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return Home
            </span>
          </button>
        </div>

        {/* Helper text */}
        <p
          className="mt-8 text-rose-700/60 text-sm animate-fade-in-up"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            animationDelay: "0.8s",
          }}
        >
          or press the back button in your browser
        </p>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap");

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-50px) rotate(5deg);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes spin-medium {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-medium-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }

        .animate-spin-medium {
          animation: spin-medium 15s linear infinite;
        }

        .animate-spin-medium-reverse {
          animation: spin-medium-reverse 18s linear infinite;
        }
      `}</style>
    </div>
  );
}
