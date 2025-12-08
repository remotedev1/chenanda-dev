"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Banner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      id="payment"
      className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 scroll-mt-24"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItMnptMCAwdjItMnptMCAwdjItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>

      {/* Close button - better positioned for mobile */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-110"
        aria-label="Close banner"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8 animate-slideIn">
          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left space-y-2 sm:space-y-3 md:space-y-4 w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm animate-pulse">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></span>
              Registration Open
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight px-2 sm:px-0">
              Upcoming Tournament – Register Now!
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0 leading-relaxed">
              Join athletes from around the region in our annual championship
              tournament. Compete at the highest level, showcase your skills,
              and win amazing prizes.
            </p>

            {/* Date Info */}
            <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-gray-600 px-2 sm:px-0 flex-wrap">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-600 flex-shrink-0" />
              <span className="text-center lg:text-left">
                Last Registration Date:{" "}
                <span className="font-bold text-indigo-700 whitespace-nowrap">
                  December 20, 2025
                </span>
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Link href="/secure/payment">
              <Button
                size="lg"
                className="group bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Register & Pay Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }

        /* Ensure proper touch targets on mobile */
        @media (max-width: 640px) {
          button {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
