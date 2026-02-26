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

  const logoTransform = useMemo(() => {
    if (pathname !== "/" || isFixed) return "translate-y-0";
    return "-translate-y-20 xs:-translate-y-20 sm:-translate-y-24 md:-translate-y-28";
  }, [pathname, isFixed]);

  return (
    <m.div
      initial={shouldReduceMotion ? { opacity: 1 } : { x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
      className="flex items-center"
    >
      <Link
        href="/"
        className={`no-underline cursor-pointer transition-all duration-500 ${logoTransform}`}
      >
        <Image
          src="/logo-red.png"
          alt="Logo"
          width={125}
          height={125}
          priority
        />
      </Link>
    </m.div>
  );
});

Logo.displayName = "Logo";

// Memoized Mobile Navigation
const MobileNav = memo(({ open, setOpen }) => {
  const navLinks = useMemo(
    () => [
      { href: "#", label: "Home" },
      { href: "#", label: "About" },
      { href: "#", label: "Services" },
      { href: "#", label: "Contact" },
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
          <Menu className="w-6 h-6 hover:text-yellow-400 transition-colors duration-300" />
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

  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    setIsFixed(window.scrollY > 10);
  }, []);

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
        "flex justify-between items-center w-full",
        "px-3 xs:px-4 sm:px-5 md:px-6 lg:px-10 xl:px-20",
        "py-2 xs:py-2.5 sm:py-3 md:py-3.5",
        "transition-all duration-700",
        pathname !== "/" || isFixed
          ? "bg-white shadow-lg shadow-black/30"
          : "bg-black/40 shadow-lg",
      ),
    [pathname, isFixed],
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <header className="fixed w-full left-0 z-50">
        <div className={headerClass}>
          {/* Logo */}
          <Logo pathname={pathname} isFixed={isFixed} />

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <MobileNav open={open} setOpen={setOpen} />

            {/* Login/User */}
            <Link
              href="/auth/login"
              className="no-underline cursor-pointer"
              aria-label="Login"
            >
              <User
                className={clsx(
                  "w-6 h-6 hover:text-yellow-400 transition-colors duration-300",
                  iconColor,
                )}
              />
            </Link>
          </div>
        </div>
      </header>
    </LazyMotion>
  );
}
