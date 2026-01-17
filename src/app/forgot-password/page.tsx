"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const auth = useAuth();
  const [message, setMessage] = useState(
    "If an account with this email exists, a password reset link has been sent."
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    form.clearErrors();
    try {
      await sendPasswordResetEmail(auth, values.email);
      setSubmitted(true);
    } catch (error) {
      // Don't show specific errors to prevent email enumeration
      setSubmitted(true); // Still show success message
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            {submitted
              ? "Check your inbox for a reset link."
              : "Enter your email to reset your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button asChild className="w-full">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="m@example.com"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                Remembered your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-accent-foreground/80 underline-offset-4 hover:text-accent-foreground hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
