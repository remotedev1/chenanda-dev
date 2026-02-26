"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowLeft,
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

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      setError(
        "No reset token provided. Please request a new password reset link."
      );
    }
  }, [token]);

  const onSubmit = (values) => {
    if (!token) {
      setError(
        "Invalid reset token. Please request a new password reset link."
      );
      return;
    }

    setError("");
    setSuccess("");

    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...values, token }),
          });

          const data = await res.json();

          if (data.error) {
            setError(data.error);
          } else if (data.success) {
            setSuccess(data.success);
            form.reset();
            setTimeout(() => {
              router.push("/auth/login");
            }, 2000);
          }
        } catch (e) {
          console.error("Reset password error:", e);
          setError(
            "Network error. Please check your connection and try again."
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
          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Secure Password Reset
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="grid gap-0">
            {/* Left Side - Branding */}
            <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-orange-300 to-orange-700 dark:from-indigo-700 dark:to-purple-800 text-white">
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your new password below
                </p>
              </div>

              {/* Form Content */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* New Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <Input
                              {...field}
                              disabled={isPending || !token}
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                              disabled={isPending || !token}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                          Confirm New Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <Input
                              {...field}
                              disabled={isPending || !token}
                              type={
                                showConfirmPassword ? "text" : "password"
                              }
                              placeholder="••••••••"
                              className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                              disabled={isPending || !token}
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
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
                      className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                          {success}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Redirecting to login...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    disabled={isPending || !token}
                    type="submit"
                    className="w-full h-12 border hover:bg-blue-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Resetting Password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        <span>Reset Password</span>
                      </div>
                    )}
                  </Button>

                  {/* Back to Login */}
                  <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-colors"
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
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2026 Admin Panel. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};