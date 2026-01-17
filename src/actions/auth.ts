"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

export async function login(prevState: any, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In a real app, you'd validate and check credentials against a database.
  console.log("User logged in with:", Object.fromEntries(formData));
  redirect("/dashboard");
}

export async function signup(prevState: any, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In a real app, you'd create a new user in the database.
  console.log("User signed up with:", Object.fromEntries(formData));
  redirect("/dashboard");
}

export async function resetPassword(prevState: any, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In a real app, you'd generate a reset token and send an email.
  console.log("Password reset request for:", Object.fromEntries(formData));
  return {
    message: "If an account with this email exists, a password reset link has been sent.",
  };
}

export async function logout() {
  // In a real app, you'd invalidate the user's session.
  redirect("/login");
}
