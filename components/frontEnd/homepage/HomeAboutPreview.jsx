import React from "react";
import Link from "next/link";

export default function HomeAboutPreview() {
  return (
    <section
      id="about-us-section"
      className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amber-900 mb-3 tracking-tight">
            The Chenanda Okka
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Card 1 - Heritage */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl mb-3">🏡</div>
            <h3 className="text-xl font-bold text-amber-900 mb-3">
              Our Heritage
            </h3>
            <p className="text-gray-700 leading-relaxed">
              A close-knit family of over 300 members, deeply rooted in Kokeri
              with branches across Coorg, united by togetherness and respect for
              tradition.
            </p>
          </div>

          {/* Card 2 - Excellence */}
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6 shadow-lg text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-bold mb-3">Legacy of Excellence</h3>
            <p className="leading-relaxed">
              Home to Olympians, Army officers, educators, and cultural
              enthusiasts—including Dronacharya and Arjuna Award recipients.
            </p>
          </div>

          {/* Card 3 - Sports */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-4xl mb-3">🏑</div>
            <h3 className="text-xl font-bold text-green-900 mb-3">
              Hockey Legacy
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Generations of contributing to Kodava hockey culture through
              mentoring, nurturing talent, and upholding the spirit of
              sportsmanship.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { number: "300+", label: "Family Members" },
            { number: "5", label: "Locations" },
            { number: "2", label: "Olympians" },
            { number: "100+", label: "Years Legacy" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-center shadow border border-amber-100"
            >
              <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg sm:text-xl text-gray-700 mb-6 italic max-w-3xl mx-auto">
            &quot;Rooted in tradition and driven by excellence, the Chenanda
            Okka continues to shape the future while honoring its past.&quot;
          </p>

          <Link
            href="/about-us"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span>Discover Our Story</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
