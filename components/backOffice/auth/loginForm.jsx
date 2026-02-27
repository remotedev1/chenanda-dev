"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Mail, Shield, Lock, EyeOff, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoginSchema, PhoneLoginSchema } from "@/schemas/auth.schema";
import Image from "next/image";
import Link from "next/link";

export default function LoginForm({ redirectTo = "/dashboard" }) {
  const [activeTab, setActiveTab] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showPhonePassword, setShowPhonePassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || redirectTo;

  // Email form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: emailLoading },
    reset: resetEmail,
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  // Phone form
  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors, isSubmitting: phoneLoading },
    reset: resetPhone,
    setValue: setPhoneValue,
  } = useForm({
    resolver: zodResolver(PhoneLoginSchema),
  });

  const onEmailLogin = async (data) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: data, callbackUrl }),
      });

      const result = await res.json();

      if (result.error) {
        toast.error(result.error);
        if (result.remainingAttempts !== undefined)
          toast.warning(`${result.remainingAttempts} attempts remaining`);
        if (result.requiresVerification)
          toast.error("Please verify your email to continue");
        return;
      }

      if (result.success) {
        toast.success("Login successful. Redirecting...");
        resetEmail();
        setTimeout(() => {
          router.push(result.redirectTo || callbackUrl);
          router.refresh();
        }, 500);
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  const onPhoneLogin = async (data) => {

    try {
      const res = await fetch("/api/auth/login/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, callbackUrl }),
      });

      const result = await res.json();

      if (result.error) {
        toast.error(result.error);
        if (result.remainingAttempts !== undefined)
          toast.warning(`${result.remainingAttempts} attempts remaining`);
        return;
      }

      if (result.success) {
        toast.success("Login successful. Redirecting...");
        resetPhone();
        setTimeout(() => {
          router.push(result.redirectTo || callbackUrl);
          router.refresh();
        }, 500);
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="lg:w-[30vw]">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Secure Login
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid gap-0">
            {/* Branding */}
            <div className="flex flex-col justify-center items-center p-12 bg-gradient-to-br from-orange-300 to-orange-700 text-white">
              <Image src="/logo-red.png" alt="Logo" width={150} height={150} className="mx-auto" />
            </div>

            {/* Form */}
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="email"
                    className="flex items-center gap-2 border-2 border-slate-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
                  >
                    <Mail className="h-4 w-4" /> Email
                  </TabsTrigger>
                  <TabsTrigger
                    value="phone"
                    className="flex items-center gap-2 border-2 border-slate-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
                  >
                    <Phone className="h-4 w-4" /> Phone
                  </TabsTrigger>
                </TabsList>

                {/* Email Login */}
                <TabsContent value="email">
                  <form onSubmit={handleEmailSubmit(onEmailLogin)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          disabled={emailLoading}
                          {...registerEmail("email")}
                          className={`pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                            emailErrors.email ? "border-red-500 focus:ring-red-500" : ""
                          }`}
                        />
                      </div>
                      {emailErrors.email && (
                        <p className="text-red-500 text-xs">{emailErrors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={emailLoading}
                          {...registerEmail("password")}
                          className={`pl-10 pr-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                            emailErrors.password ? "border-red-500 focus:ring-red-500" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {emailErrors.password && (
                        <p className="text-red-500 text-xs">{emailErrors.password.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={emailLoading}
                      className="w-full h-12 border hover:bg-blue-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Phone Login */}
                <TabsContent value="phone">
                  <form onSubmit={handlePhoneSubmit(onPhoneLogin)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500">
                          +91
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          maxLength={10}
                          disabled={phoneLoading}
                          {...registerPhone("phoneNumber", {
                            onChange: (e) => {
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setPhoneValue("phoneNumber", digits, { shouldValidate: true });
                            },
                          })}
                          className={`pl-20 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                            phoneErrors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""
                          }`}
                        />
                      </div>
                      {phoneErrors.phoneNumber && (
                        <p className="text-red-500 text-xs">{phoneErrors.phoneNumber.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="phone-password"
                          type={showPhonePassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={phoneLoading}
                          {...registerPhone("password")}
                          className={`pl-10 pr-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                            phoneErrors.password ? "border-red-500 focus:ring-red-500" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPhonePassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPhonePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {phoneErrors.password && (
                        <p className="text-red-500 text-xs">{phoneErrors.password.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={phoneLoading}
                      className="w-full h-12 border hover:bg-blue-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phoneLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          <span>Sign In</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2026 Admin Panel. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}