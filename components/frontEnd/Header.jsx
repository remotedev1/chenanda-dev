"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Menu,
  User,
  Globe,
  Linkedin,
  Facebook,
  Twitter,
  X,
  CircleX,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import clsx from "clsx";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const iconColor = isFixed || pathname !== "/" ? "text-black" : "text-white";

  return (
    <div>
      <header className="fixed w-full left-0 z-50">
        {/* 🔹 Main Header */}
        <div
          className={`
            flex justify-between items-center w-full 
            px-3 xs:px-4 sm:px-5 md:px-6 lg:px-10 xl:px-20
            py-2 xs:py-2.5 sm:py-3 md:py-3.5
            transition-all duration-700
            ${
              pathname !== "/" || isFixed
                ? "bg-primary shadow-lg shadow-black/30"
                : "bg-black/40 shadow-lg"
            }
          `}
        >
          {/* Logo */}

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center"
          >
            <Link
              href="/"
              className={`
                no-underline cursor-pointer transition-all duration-500
                ${
                  pathname !== "/" || isFixed
                    ? "translate-y-0"
                    : "-translate-y-16 xs:-translate-y-20 sm:-translate-y-24 md:-translate-y-28"
                }
              `}
            >
              <Image
                src="/logo-red.png"
                alt="Logo"
                width={125}
                height={125}
                priority
              />
            </Link>
          </motion.div>

          {/* Left side */}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded">
                  <Menu
                    className={clsx(
                      "w-6 h-6 hover:text-yellow-400 transition-colors duration-300",
                      iconColor
                    )}
                  />
                </button>
              </SheetTrigger>

              <SheetContent
                side="top"
                className="w-full h-full bg-black p-8 [&>button]:hidden"
              >
                <SheetClose asChild className=" flex justify-self-end">
                  <CircleX className="w-10 h-10 text-red-600 hover:text-red-400  transition-colors duration-300 cursor-pointer" />
                </SheetClose>
                <nav className="space-y-6 flex flex-col items-center justify-center h-full text-lg font-medium  text-white">
                  <Link
                    href="#"
                    className="hover:text-yellow-400"
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="#"
                    className="hover:text-yellow-400"
                    onClick={() => setOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="hover:text-yellow-400"
                    onClick={() => setOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    href="#"
                    className="hover:text-yellow-400"
                    onClick={() => setOpen(false)}
                  >
                    Contact
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Login/User */}
            <Link href="/auth/login" className="no-underline cursor-pointer">
              <User
                className={clsx(
                  "w-6 h-6 hover:text-yellow-400 transition-colors duration-300",
                  iconColor
                )}
              />
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
