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
import { Button } from "../ui/button";
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
      <header className={clsx("fixed w-full left-0 z-50  ")}>
        {/* 🔹 Main Header */}
        <div
          className={clsx(
            "flex justify-between items-center w-full px-6 py-4 md:px-10 lg:px-20  transition-all duration-700",
            pathname !== "/" || isFixed
              ? "bg-primary shadow-lg shadow-black/30" // when not home OR fixed
              : "bg-black/40 shadow-lg" // home and not fixed
          )}
        >
          {/* Logo */}

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center space-x-2"
          >
            <Link
              href="/"
              className={cn(
                "no-underline cursor-pointer transition-all duration-500",
                pathname !== "/" || isFixed
                  ? "translate-y-0"
                  : "-translate-y-28"
              )}
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

              <SheetContent side="top" className="w-full h-full bg-black p-8">
                <SheetClose asChild className=" flex justify-self-end">
                  <CircleX className=" text-red-600 hover:text-red-400  transition-colors duration-300 cursor-pointer" />
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
