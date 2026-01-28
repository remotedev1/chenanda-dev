"use client";
export default function AboutPage() {
  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden mt-20">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-amber-900 mb-4 tracking-tight">
            About the Chenanda Okka
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 mx-auto rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column - Heritage */}
          <div className="space-y-6 animate-slide-in-left">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold text-amber-900 mb-4 flex items-center gap-3">
                <span className="text-4xl">🏡</span>
                Our Heritage
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                The Chenanda Okka is a close-knit family of over{" "}
                <span className="font-semibold text-amber-800">
                  300 members
                </span>
                , deeply rooted in{" "}
                <span className="font-semibold text-amber-800">Kokeri</span>,
                with family branches spread across Murnad, Banavara, Kettoli,
                and Virajpet in the heart of Coorg.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-3xl font-bold text-amber-900 mb-4 flex items-center gap-3">
                <span className="text-4xl">🤝</span>
                Our Values
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                United across generations, the Okka stands as a symbol of{" "}
                <span className="font-semibold text-amber-800">
                  togetherness
                </span>
                ,{" "}
                <span className="font-semibold text-amber-800">
                  respect for elders
                </span>
                , and an enduring sense of{" "}
                <span className="font-semibold text-amber-800">belonging</span>.
              </p>
            </div>
          </div>

          {/* Right Column - Achievements */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-8 shadow-xl text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="text-4xl">🏆</span>
                Legacy of Excellence
              </h3>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  It is a matter of immense pride that members of the Chenanda
                  family have served the nation and society with distinction:
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🎖️</span>
                    <span>Indian Army officers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🥇</span>
                    <span>Olympians and sportspersons</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">📚</span>
                    <span>Teachers and educators</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🎭</span>
                    <span>Cultural enthusiasts</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-orange-200 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                National Recognition
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                The family is especially honored to have produced{" "}
                <span className="font-bold text-orange-800">
                  two eminent Olympians
                </span>
                , including recipients of the prestigious{" "}
                <span className="font-bold text-orange-800">
                  Dronacharya Award
                </span>{" "}
                and{" "}
                <span className="font-bold text-orange-800">Arjuna Award</span>,
                reflecting a legacy of discipline, dedication, and sporting
                excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Heritage & Culture Section */}
        <div className="mb-16 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 rounded-2xl p-8 shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
              <h4 className="text-3xl font-bold mb-4 flex items-center gap-3 text-purple-900">
                <span className="text-4xl">🏠</span>
                Ancestral Heritage
              </h4>
              <p className="text-lg leading-relaxed text-gray-800">
                The Chenanda Okka is home to a beautiful ancestral house in
                Kokeri, a living testament to heritage, tradition, and cultural
                continuity. The family remains committed to preserving and
                passing on Kodava customs, values, and cultural identity to
                future generations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100 rounded-2xl p-8 shadow-xl border border-indigo-200 hover:shadow-2xl transition-all duration-300">
              <h4 className="text-3xl font-bold mb-4 flex items-center gap-3 text-indigo-900">
                <span className="text-4xl">🎯</span>
                Cultural Commitment
              </h4>
              <p className="text-lg leading-relaxed text-gray-800">
                Alongside sporting achievements, the Chenanda family actively
                preserves Kodava customs, traditional practices, and cultural
                values, ensuring that each generation remains connected to their
                rich heritage and identity.
              </p>
            </div>
          </div>
        </div>

        {/* Hockey Legacy Section */}
        <div className="mb-16 animate-fade-in">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-10 shadow-2xl text-white">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">🏑</span>
              <h3 className="text-4xl font-bold">The Hockey Legacy</h3>
            </div>
            <p className="text-xl leading-relaxed">
              Sports—particularly{" "}
              <span className="font-bold underline decoration-white/50">
                hockey
              </span>
              —run deep in the Chenanda lineage. Across generations, the family
              has actively contributed to the rich Kodava hockey culture by
              nurturing talent, mentoring young players, and upholding the
              spirit of sportsmanship that Coorg is known for.
            </p>
          </div>
        </div>

        {/* Tournament Announcement */}
        <div className="mb-16 animate-fade-in-up">
          <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-12 shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative text-center text-white">
              <div className="inline-block mb-4">
                <span className="text-6xl sm:text-7xl">🏆</span>
              </div>
              <h3 className="text-4xl sm:text-5xl font-bold mb-4">
                Chenanda Hockey Tournament 2026
              </h3>
              <div className="text-3xl sm:text-4xl font-bold mb-6 bg-white/20 backdrop-blur-sm rounded-2xl py-4 px-8 inline-block border-2 border-white/40">
                5th April 2026
              </div>
              <p className="text-xl sm:text-2xl leading-relaxed max-w-4xl mx-auto mb-8">
                Carrying this legacy forward, the Chenanda family is proud to
                organize a Hockey Tournament with the purpose of:
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {[
                  { icon: "⚡", text: "Promoting youth sports" },
                  { icon: "🌟", text: "Honoring past legends" },
                  { icon: "🤝", text: "Strengthening community bonds" },
                  { icon: "🚀", text: "Inspiring future athletes" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border-2 border-white/40 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <div className="text-lg font-semibold">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-amber-200 max-w-4xl mx-auto">
            <p className="text-2xl sm:text-3xl font-bold text-amber-900 leading-relaxed italic">
              &ldquo;Rooted in tradition and driven by excellence, the Chenanda
              Okka continues to shape the future while honoring its past.&rdquo;
            </p>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up">
          {[
            { number: "300+", label: "Family Members" },
            { number: "5", label: "Locations" },
            { number: "2", label: "Olympians" },
            { number: "100+", label: "Years of Legacy" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </section>
  );
}
