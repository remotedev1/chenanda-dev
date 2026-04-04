"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import { Menu, User, CircleX } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import clsx from "clsx";
import Link from "next/link";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useIsMobile } from "@/hooks/useMobile";

// Memoized Navigation Link Component
const NavLink = memo(({ href, children, onClick }) => (
  <Link href={href} className="hover:text-yellow-400" onClick={onClick}>
    {children}
  </Link>
));

NavLink.displayName = "NavLink";

// Memoized Logo Component
const Logo = memo(({ pathname, isFixed }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Link
      href="/"
      className={`no-underline cursor-pointer transition-all duration-500 `}
    >
      <Image src="/logo-bull.png" alt="Logo" width={60} height={60} priority />
    </Link>
  );
});

Logo.displayName = "Logo";

// Memoized Mobile Navigation
const MobileNav = memo(({ open, setOpen }) => {
  const navLinks = useMemo(
    () => [
      { href: "#", label: "Home" },
      { href: "/about-us", label: "About Chenanda" },
      { href: "/about-tournament", label: "About Tournament" },
      { href: "/gallery", label: "Gallery" },
      { href: "#contact", label: "Contact" },
    ],
    [],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 rounded" aria-label="Open menu">
          <Menu className="w-6 h-6 text-white hover:text-yellow-400 transition-colors duration-300" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="top"
        className="w-full h-full bg-black p-8 [&>button]:hidden"
      >
        <SheetClose asChild className="flex justify-self-end">
          <CircleX className="w-10 h-10 text-red-600 hover:text-red-400 transition-colors duration-300 cursor-pointer" />
        </SheetClose>
        <nav className="space-y-6 flex flex-col items-center justify-center h-full text-lg font-medium text-white">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href} onClick={handleClose}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
});

MobileNav.displayName = "MobileNav";

// Main Header Component
export default function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const mobile = useIsMobile();

  const data = useSession();
  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    setIsFixed(window.scrollY > 10);
  }, []);

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About-us" },
      { href: "/about-tournament", label: "About Tournament" },
      { href: "/gallery", label: "Gallery" },
      { href: "#contact", label: "Contact" },
    ],
    [],
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Memoized computed values
  const iconColor = useMemo(
    () => (isFixed || pathname !== "/" ? "text-black" : "text-white"),
    [isFixed, pathname],
  );

  const headerClass = useMemo(
    () =>
      clsx(
        "w-full py-2 xs:py-2.5 sm:py-3 md:py-3.5 transition-all",
        pathname === "/"
          ? isFixed
            ? "bg-primary shadow-lg shadow-black/30" // home + scrolled
            : "bg-transparent" // home + top
          : "bg-primary shadow-lg shadow-black/30", // any other page
      ),
    [pathname, isFixed],
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <header className="w-full fixed left-0 z-50">
        <div className={headerClass}>
          {/* ── Container ── */}
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center  px-6 lg:px-2 pt-4 lg:pt-0">
            {/* Logo */}
            <Logo pathname={pathname} isFixed={isFixed} />

            {/* center */}
            {!mobile && (
              <div className="flex-1 flex justify-center">
                <nav className="flex space-x-6">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={clsx(
                          "relative pb-0.5 transition-colors duration-300",
                          isActive
                            ? "text-white underline underline-offset-4 decoration-2"
                            : "text-white/50 hover:text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <MobileNav open={open} setOpen={setOpen} />
              {data.status === "authenticated" && (
                <Link
                  href="/auth/login"
                  className="no-underline cursor-pointer"
                  aria-label="Login"
                >
                  <User
                    className={clsx(
                      "w-6 h-6 hover:text-yellow-400 text-white transition-colors duration-300",
                    )}
                  />
                </Link>
              )}
            </div>
          </div>
          {/* ── /Container ── */}
        </div>
      </header>
    </LazyMotion>
  );
}
