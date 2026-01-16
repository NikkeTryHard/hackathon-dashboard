import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the authenticated dashboard
  // The (authenticated) layout will handle redirecting to /login if not authenticated
  redirect("/login");
}
