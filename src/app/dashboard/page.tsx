import { redirect } from "next/navigation";

export default function DashboardPage() {
  // This page is no longer used and will redirect.
  redirect("/");
  return null;
}
