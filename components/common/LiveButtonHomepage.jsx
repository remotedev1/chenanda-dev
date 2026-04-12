"use client";
import Link from "next/link";
import React, { useState } from "react";

const LiveButtonHomepage = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <Link
        href="#live"
        onClick={() => setVisible(false)}
        className="relative inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-xs font-semibold tracking-widest px-4 py-2 rounded-full transition-all duration-150 no-underline"
      >
        <span className="relative flex items-center justify-center w-2.5 h-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </span>
        <span className="group-hover:hidden">LIVE</span>
        <span className="hidden group-hover:inline">Click ↓</span>
      </Link>
    </div>
  );
};

export default LiveButtonHomepage;
