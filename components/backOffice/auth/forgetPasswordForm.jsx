"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address.")
    .transform((v) => v.toLowerCase().trim()),
});

export const ForgotPasswordForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  const form = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      if (error) setError("");
      if (success) setSuccess("");
    });
    return () => subscription.unsubscribe();
  }, [form, error, success]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = (values) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          const data = await res.json();

          if (data.error) {
            setError(data.error);
          } else if (data.success) {
            setSuccess(data.success);
            form.reset();
            setCooldown(60);
          }
        } catch (e) {
          console.error("Forgot password error:", e);
          setError(
            "Network error. Please check your connection and try again.",
          );
        }
      })();
    });
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-[30vw]">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-indigo-600 " />
          <span className="text-sm font-medium text-gray-700 ">
            Secure Password Reset
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 ">
          <div className="grid  gap-0">
            {/* Left Side - Branding */}
            <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-orange-300 to-orange-700  text-white">
              <div className="space-y-6 text-center">
                <Image
                  src="/logo-red.png"
                  alt="Logo"
                  width={150}
                  height={150}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <Image
                  src="/logo-red.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="mx-auto mb-8 block md:hidden"
                />
                <h1 className="text-3xl font-bold text-gray-900  mb-2">
                  Forgot Password
                </h1>
                <p className="text-gray-600 ">
                  Enter your email to receive a password reset link
                </p>
              </div>

              {/* Form Content */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700  font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              disabled={isPending}
                              className="pl-10 h-12 border-gray-300  focus:border-indigo-500 focus:ring-indigo-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Error Message */}
                  {error && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="flex items-start gap-3 p-4 bg-red-50  border border-red-200  rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex items-start gap-3 p-4 bg-green-50  border border-green-200 Q rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800 font-medium">
                        {success}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isPending || cooldown > 0}
                    className="w-full h-12 border hover:bg-blue-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : cooldown > 0 ? (
                      `Resend in ${cooldown}s`
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        <span>Send Reset Link</span>
                      </div>
                    )}
                  </Button>

                  {/* Back to Login */}
                  <div className="mt-6 text-center text-sm text-gray-600 ">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-500  hover:underline transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 ">
          <p>© 2026 Admin Panel. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};