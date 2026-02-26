"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifySuccessPage() {
  const searchParams = useSearchParams();
  const already = searchParams.get("already");

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white text-center">
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
            <h1 className="text-2xl font-bold">Email Verified!</h1>
          </div>

          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {already ? "Already Verified" : "Success!"}
            </h2>
            
            <p className="text-gray-600 mb-8">
              {already 
                ? "Your email is already verified. You can now log in to your account."
                : "Your email has been verified successfully. You can now access all features of your account."}
            </p>

            <Link href="/auth/login">
              <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                Continue to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}