"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { XCircle, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason");
  const email = searchParams.get("email");

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const getErrorMessage = () => {
    switch (reason) {
      case "rate-limit":
        return "Too many verification attempts. Please try again later.";
      case "missing-token":
        return "No verification token provided. Please check your email link.";
      case "invalid-token":
        return "The verification link is invalid or malformed.";
      case "invalid-or-used":
        return "This verification link is invalid or has already been used.";
      case "expired":
        return "This verification link has expired. Please request a new one.";
      case "user-not-found":
        return "User account not found. Please contact support.";
      case "blocked":
        return "Your account has been suspended. Please contact support.";
      case "server-error":
        return "A server error occurred. Please try again later.";
      default:
        return "Email verification failed. Please try again.";
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setIsResending(true);
    setResendMessage("");

    try {
      const response = await fetch(
        `/api/auth/resend-email-verification?email=${encodeURIComponent(email)}`,
        { method: "GET" }
      );

      const data = await response.json();
      console.log(response.json());
      if (response.ok) {
        setResendMessage("✓ Verification email sent! Please check your inbox.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setResendMessage(
          `✗ ${data.error || "Failed to resend verification email."}`
        );
      }
    } catch (error) {
      console.error("Resend error:", error);
      setResendMessage("✗ Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Verification Failed</h1>
          </div>

          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Something Went Wrong
            </h2>

            <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

            {/* Resend Message */}
            {resendMessage && (
              <div
                className={`mb-6 p-4 rounded-lg text-sm ${
                  resendMessage.startsWith("✓")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {resendMessage}
              </div>
            )}

            {/* Show resend button for expired or invalid tokens */}
            {(reason === "expired" ||
              reason === "invalid-or-used" ||
              reason === "invalid-token") &&
              email && (
                <div className="mb-4 space-y-4">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Request New Verification Email
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Email will be sent to:{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>
              )}

            <div className="pt-4 border-t border-gray-200">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full h-12">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
