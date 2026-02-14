import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const params = searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/bookmarks");
  }

  const errorMessage =
    params.error === "missing_config"
      ? "App not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      : params.error === "no_auth_url"
        ? "Google sign-in not set up. Enable Google in Supabase Auth and add Client ID/Secret."
        : params.message
          ? decodeURIComponent(params.message.replace(/\+/g, " "))
          : params.error
            ? decodeURIComponent(params.error.replace(/\+/g, " "))
            : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold tracking-tight text-slate-100">
        Smart Bookmark App
      </h1>
      <p className="max-w-md text-center text-slate-400">
        Save and sync your bookmarks privately. Sign in with Google to get
        started.
      </p>
      {errorMessage && (
        <div className="w-full max-w-md rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-center text-amber-200">
          <p className="font-medium">Sign-in issue</p>
          <p className="mt-1 text-sm">{errorMessage}</p>
          <p className="mt-2 text-sm">
            See <strong>SETUP_GUIDE.md</strong> in the project for step-by-step
            config. No local SQL server needed — everything runs in Supabase
            cloud.
          </p>
        </div>
      )}
      <Link
        href="/auth/signin"
        className="rounded-lg bg-slate-700 px-6 py-3 font-medium text-white transition hover:bg-slate-600"
      >
        Sign in with Google
      </Link>
    </main>
  );
}
