"use client";
import { Phone, MessageCircle, Trophy, MapPin } from "lucide-react";

const CONTACT = {
  name: "Rohan Ponnaiah",
  role: "Tournament Coordinator",
  phone: "+91 8861921427",
  raw: "+91 8861921427", 
  whatsapp: "918861921427",
  location: "Kodagu, Karnataka",
};

export default function TournamentContactCard() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      {/* Card */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
        {/* Top stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Inner */}
        <div className="px-6 pt-6 pb-7 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Kodava Hockey Tournament 2026
            </span>
          </div>

          {/* Headline */}
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-widest mb-1">
              For Registrations, Contact
            </p>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              {CONTACT.name}
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">{CONTACT.role}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
              <MapPin className="w-3 h-3" />
              {CONTACT.location}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-stone-200" />

          {/* Phone display */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-stone-400">Phone / WhatsApp</p>
              <p className="text-base font-bold text-stone-800 tabular-nums tracking-wide">
                {CONTACT.phone}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${CONTACT.raw}`}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all duration-150 shadow-md shadow-emerald-200"
            >
              <Phone className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Call Now</span>
            </a>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=Hi%2C+I%27d+like+to+register+for+the+Kodava+Hockey+Tournament+2026`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-900 hover:bg-stone-700 active:scale-95 transition-all duration-150 shadow-md shadow-stone-200"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">WhatsApp</span>
            </a>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-stone-400 leading-relaxed">
            Available Mon–Sat · 9 AM – 7 PM IST
          </p>
        </div>
      </div>
    </div>
  );
}
