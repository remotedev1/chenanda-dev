"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession, signOut } from "next-auth/react"; // ✅ FIX 1: Added signOut import
import { useRouter } from "next/navigation"; // ✅ FIX 2: Added router import
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Info,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(100, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  });

export const ChangePasswordForm = () => {
  const { data: session } = useSession();
  const router = useRouter(); // ✅ FIX 2: router now defined
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values) => {
    setError("");
    setSuccess("");
    setRemainingAttempts(null);

    // ✅ FIX 3: Correct async pattern inside startTransition
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          const data = await res.json();

          if (data.error) {
            setError(data.error);
            if (data.remainingAttempts !== undefined) {
              setRemainingAttempts(data.remainingAttempts);
            }
          } else if (data.success) {
            setSuccess(data.success);
            form.reset();
            // ✅ FIX 4: Removed duplicate commented-out signOut — using single clean flow
            await signOut({ redirect: false });
            setTimeout(() => router.push("/auth/login"), 2000);
          }
        } catch (e) {
          console.error("Change password error:", e);
          setError(
            "Network error. Please check your connection and try again.",
          );
        }
      })();
    });
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <CardHeader className="space-y-1 pb-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Change Password
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Update your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Security Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>At least 8 characters long</li>
                  <li>Different from your current password</li>
                  <li>Use a strong, unique password</li>
                </ul>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Current Password */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                      Current Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <Input
                          {...field}
                          disabled={isPending}
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                          disabled={isPending}
                          aria-label={
                            showCurrentPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showCurrentPassword ? (
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

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
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
                          disabled={isPending}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                          disabled={isPending}
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showNewPassword ? (
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
                          disabled={isPending}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                          disabled={isPending}
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
                  <div className="flex-1">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                      {error}
                    </p>
                    {remainingAttempts !== null && remainingAttempts > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {remainingAttempts}{" "}
                        {remainingAttempts === 1 ? "attempt" : "attempts"}{" "}
                        remaining
                      </p>
                    )}
                    {remainingAttempts === 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
                        Account temporarily locked. Please try again later.
                      </p>
                    )}
                  </div>
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
                      Signing out and redirecting to login...
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                disabled={isPending}
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-700 dark:to-blue-700 dark:hover:from-indigo-800 dark:hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Changing Password...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>Change Password</span>
                  </div>
                )}
              </Button>
            </form>
          </Form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Having trouble changing your password?{" "}
              <a
                href="/auth/forgot-password"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline font-medium transition-colors"
              >
                Reset it instead
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
