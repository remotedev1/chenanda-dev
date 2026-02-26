"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Phone,
  Mail,
  Lock,
  Shield,
  AlertCircle,
  CheckCircle2,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  PhoneSchema,
  OTPSchema,
  RegisterSchema,
  RegisterPhoneSchema,
} from "@/schemas/auth.schema";

export default function RegisterForm() {
  const [activeTab, setActiveTab] = useState("email");
  const [phoneStep, setPhoneStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Phone registration states
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [phoneData, setPhoneData] = useState(null); // Store phone form data

  const router = useRouter();

  // Email registration form
  const emailForm = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Phone registration form
  const phoneForm = useForm({
    resolver: zodResolver(RegisterPhoneSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle phone number input (allow only digits, max 10)
  const handlePhoneInput = (e, field) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    field.onChange(value);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setOtpError("");
  };

  // Cooldown timer
  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send OTP - Phone registration step 1
  const onPhoneSubmit = async (values) => {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: values.phoneNumber,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPhoneData(values); // Store form data for OTP step
        setPhoneStep("otp");
        startResendCooldown();
        toast.success("OTP sent successfully");
      } else {
        setServerError(data.error || "Failed to send OTP");
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setServerError("Network error. Please try again.");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || loading || !phoneData) return;
    setLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneData.phoneNumber,
          firstName: phoneData.firstName,
          lastName: phoneData.lastName,
          password: phoneData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOtp("");
        startResendCooldown();
        toast.success("OTP resent successfully");
      } else {
        toast.error(data.error || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Register - Phone registration step 2
  const verifyOTPAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");

    console.log("i ran")

    const validation = OTPSchema.safeParse({ otp });
    if (!validation.success) {
      setOtpError(validation.error.errors[0].message);
      toast.error(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneData.phoneNumber,
          otp,
          firstName: phoneData.firstName,
          lastName: phoneData.lastName,
          password: phoneData.password,
          step: "phone",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Registration successful! Redirecting to login...");

        // Clear form
        phoneForm.reset();
        setOtp("");
        setPhoneData(null);
        setPhoneStep("phone");

        // Redirect to login
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setOtpError(data.error || "Invalid OTP");
        toast.error(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Email registration submit
  const onEmailSubmit = async (values) => {
    setLoading(true);
    setServerError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, step: "email" }),
      });

      const data = await res.json();

      if (data.error) {
        setServerError(data.error);
        toast.error(data.error);
        setLoading(false);
        return;
      }

      if (data.success) {
        setSuccess(true);
        toast.success("Registration successful! Redirecting to login...");
        emailForm.reset();
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setServerError(
        "Network error. Please check your connection and try again.",
      );
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Go back to phone details step
  const handleBackToPhone = () => {
    setPhoneStep("phone");
    setOtp("");
    setOtpError("");
    setPhoneData(null);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="lg:w-[35vw]">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            Secure Registration
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="grid gap-0">
            {/* Left Side - Branding */}
            <div className="flex flex-col justify-center items-center p-12 bg-gradient-to-br from-orange-300 to-orange-700 text-white">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Your Account
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Get started with your new account
                </p>
              </div>

              {/* Form Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="email"
                    className="flex items-center gap-2 border-2 border-slate-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>

                  <TabsTrigger
                    value="phone"
                    className="flex items-center gap-2 border-2 border-slate-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
                  >
                    <Phone className="h-4 w-4" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                {/* Email Registration */}
                <TabsContent value="email" className="space-y-4">
                  <Form {...emailForm}>
                    <form
                      onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                      className="space-y-4"
                    >
                      {/* Name Fields Row */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* First Name */}
                        <FormField
                          control={emailForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    disabled={loading || success}
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm mt-1" />
                            </FormItem>
                          )}
                        />

                        {/* Last Name */}
                        <FormField
                          control={emailForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    disabled={loading || success}
                                    className="pl-10"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm mt-1" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Email Field */}
                      <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  type="email"
                                  disabled={loading || success}
                                  className="pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                          </FormItem>
                        )}
                      />

                      {/* Password Fields Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Password */}
                        <FormField
                          control={emailForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    disabled={loading || success}
                                    className="pl-10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={loading}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm mt-1" />
                            </FormItem>
                          )}
                        />

                        {/* Confirm Password */}
                        <FormField
                          control={emailForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    placeholder="••••••••"
                                    disabled={loading || success}
                                    className="pl-10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword,
                                      )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    disabled={loading}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm mt-1" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Server Error & Success Messages */}
                      {serverError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {serverError}
                          </p>
                        </div>
                      )}

                      {success && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Registration successful!
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Redirecting to login page...
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full border hover:bg-blue-700 hover:text-white transition-all"
                        size="lg"
                        disabled={loading || success}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating Account...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Create Account
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Phone Registration */}
                <TabsContent value="phone" className="space-y-4">
                  {phoneStep === "phone" && (
                    <Form {...phoneForm}>
                      <form
                        onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                        className="space-y-4"
                      >
                        {/* Name Fields Row */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* First Name */}
                          <FormField
                            control={phoneForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      {...field}
                                      disabled={loading}
                                      className="pl-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-500 text-sm mt-1" />
                              </FormItem>
                            )}
                          />

                          {/* Last Name */}
                          <FormField
                            control={phoneForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      {...field}
                                      disabled={loading}
                                      className="pl-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-500 text-sm mt-1" />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Phone Number */}
                        <FormField
                          control={phoneForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500">
                                    +91
                                  </div>
                                  <Input
                                    {...field}
                                    type="tel"
                                    disabled={loading}
                                    className="pl-20"
                                    maxLength={10}
                                    onChange={(e) => handlePhoneInput(e, field)}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm mt-1" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Enter your 10-digit Indian phone number
                              </p>
                            </FormItem>
                          )}
                        />

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Password */}
                          <FormField
                            control={phoneForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      {...field}
                                      type={showPassword ? "text" : "password"}
                                      placeholder="••••••••"
                                      disabled={loading}
                                      className="pl-10 pr-10"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                      disabled={loading}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-500 text-sm mt-1" />
                              </FormItem>
                            )}
                          />

                          {/* Confirm Password */}
                          <FormField
                            control={phoneForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      {...field}
                                      type={
                                        showConfirmPassword
                                          ? "text"
                                          : "password"
                                      }
                                      placeholder="••••••••"
                                      disabled={loading}
                                      className="pl-10 pr-10"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowConfirmPassword(
                                          !showConfirmPassword,
                                        )
                                      }
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                      disabled={loading}
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-500 text-sm mt-1" />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Server Error */}
                        {serverError && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {serverError}
                            </p>
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full border hover:bg-blue-700 hover:text-white transition-all"
                          size="lg"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending OTP...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Send OTP
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}

                  {phoneStep === "otp" && (
                    <form onSubmit={verifyOTPAndRegister} className="space-y-4">
                      {/* Display registered details */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Name:</strong> {phoneData?.firstName}{" "}
                          {phoneData?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Phone:</strong> +91 {phoneData?.phoneNumber}
                        </p>
                      </div>

                      {/* OTP Input */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="otp"
                          className="text-base font-semibold"
                        >
                          Enter OTP
                        </Label>
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          placeholder="000000"
                          value={otp}
                          onChange={handleOtpChange}
                          disabled={loading}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest font-mono"
                        />
                        {otpError && (
                          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {otpError}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          OTP sent to +91 {phoneData?.phoneNumber}
                        </p>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full border hover:bg-blue-700 hover:text-white transition-all"
                        size="lg"
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          "Verify & Register"
                        )}
                      </Button>

                      {/* Action Links */}
                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={handleBackToPhone}
                          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1"
                          disabled={loading}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Change Details
                        </button>

                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={resendCooldown > 0 || loading}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {resendCooldown > 0
                            ? `Resend OTP in ${resendCooldown}s`
                            : "Didn't receive OTP? Resend"}
                        </button>
                      </div>
                    </form>
                  )}
                </TabsContent>
              </Tabs>

              {/* Login Link */}
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Sign In
                </Link>
              </div>
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
}
