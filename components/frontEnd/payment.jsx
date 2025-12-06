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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 animate-slideIn">
          <div className="flex-1 text-center lg:text-left space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              Registration Open
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Upcoming Tournament – Register Now!
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-gray-700 max-w-2xl">
              Join athletes from around the region in our annual championship
              tournament. Compete at the highest level, showcase your skills,
              and win amazing prizes.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base text-gray-600">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              <span>
                Last Registration Date:{" "}
                <span className="font-bold text-indigo-700">
                  December 20, 2025
                </span>
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
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
      `}</style>
    </div>
  );
}
