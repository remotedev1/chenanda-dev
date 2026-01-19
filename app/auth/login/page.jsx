"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, ArrowLeft, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function TournamentLogin({ redirectTo = "/dashboard" }) {
  const [loginMethod, setLoginMethod] = useState("phone"); // phone or email
  const [step, setStep] = useState("phone"); // phone, otp
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Email login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || redirectTo;

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("otp");
        toast.success("OTP sent successfully");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPAndLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in using NextAuth with phone-otp provider
      const signInResult = await signIn("phone-otp", {
        phoneNumber,
        otp,
        redirect: false,
      });

      if (signInResult?.ok) {
        toast.success("Login successful!");
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error(signInResult?.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          values: { email, password }, 
          callbackUrl 
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        
        // Show remaining attempts if available
        if (data.remainingAttempts !== undefined) {
          toast.warning(`${data.remainingAttempts} attempts remaining`);
        }
        
        // Check if it's a verification error
        if (data.requiresVerification) {
          toast.error("Please verify your email to continue");
        }
        
        setLoading(false);
      }

      if (data.success) {
        toast.success("Login successful. Redirecting...");
        // Clear form and redirect
        setEmail("");
        setPassword("");
        setTimeout(() => {
          window.location.href = data.redirectTo || callbackUrl || "/dashboard";
        }, 500);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={loginMethod} onValueChange={setLoginMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone" onClick={() => setStep("phone")}>
                <Phone className="mr-2 h-4 w-4" />
                Phone OTP
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Phone OTP Login */}
            <TabsContent value="phone" className="space-y-4 mt-4">
              {step === "phone" && (
                <form onSubmit={sendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+911234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your registered phone number with country code
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Phone className="mr-2 h-4 w-4" />
                    Send OTP
                  </Button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={verifyOTPAndLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      required
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      OTP sent to {phoneNumber}
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Button>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Change Number
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      onClick={sendOTP}
                      disabled={loading}
                      className="text-sm"
                    >
                      Didn't receive OTP? Resend
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* Email/Password Login */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>

                <div className="text-center">
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Register here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}