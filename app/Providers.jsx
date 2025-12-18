"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ImageKitProvider } from "imagekitio-next";
import { useEffect, useState } from "react";
import { AbilityProvider } from "@/components/providers/AbilityProvider";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

export const Providers = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  //fixing hydration error caused by sonner toaster
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;

  const authenticator = async () => {
    try {
      const res = await fetch("/api/imagekit-auth");
      if (!res.ok) throw new Error("Failed to authenticate");
      return res.json();
    } catch (error) {
      console.error("ImageKit authentication error:", error);
      throw error;
    }
  };
  return (
    <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
      <ToastProvider>
        <ImageKitProvider
          publicKey={publicKey}
          urlEndpoint={urlEndpoint}
          authenticator={authenticator}
        >
          <AbilityProvider>
          {children}
          </AbilityProvider>
        </ImageKitProvider>

        <Toaster position="top-right" richColors />
      </ToastProvider>
    </ThemeProvider>
  );
};
