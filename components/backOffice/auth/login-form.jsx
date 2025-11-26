"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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
import { FormError } from "@/components/common/form-error";
import { FormSuccess } from "@/components/common/form-success";
import { LoginSchema } from "@/schemas";
import { useToastContext } from "@/context/toast.provider";
import Image from "next/image";

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const { success: successs, error: errorr } = useToastContext();

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values, callbackUrl }),
        });

        const data = await res.json();

        if (data.error) {
          form.setError("email", { message: data.error });
          setError(data.error);
          errorr("Error!", data.error);
        }

        if (data.success) {
          setSuccess(data.success);
          successs("Success!", "Login successful");

          // Redirect after login
          window.location.href = callbackUrl || "/dashboard";
        }
      } catch (e) {
        setError("Something went wrong");
        errorr("Error!", "Something went wrong, please try again");
      }
    });
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center text-gray-600 bg-gray-50">
      <div className="relative flex flex-col sm:w-[30rem] rounded-lg border-gray-400 bg-white shadow-lg px-4">
        <div className="flex-auto p-6">
          {/* Logo */}
          <div className="mb-10 flex flex-shrink-0 flex-grow-0 items-center justify-center overflow-hidden">
            <a
              href="#"
              className="flex cursor-pointer items-center gap-2 text-indigo-500 no-underline hover:text-indigo-500"
            >
              <span className="flex-shrink-0 text-3xl font-black capitalize tracking-tight opacity-100">
                admin
              </span>
              <Image src="/logo.png" alt="Logo" width={50} height={50} />
            </a>
          </div>
          {/* /Logo */}
          <h4 className="mb-2 font-medium text-gray-700 xl:text-xl">
            Welcome to admin panel!
          </h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} type="email" />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormError message={error} />
              <FormSuccess message={success} />

              <Button disabled={isPending} type="submit" className="w-full">
                Login 
              </Button>
            </form>
          </Form>
          <Link
            className="mt-16 text-sm text-blue-500 hover:underline"
            href="/auth/forgot-password"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};
