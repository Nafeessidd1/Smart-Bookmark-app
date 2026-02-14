import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // For Vercel: use VERCEL_URL if available
  // For local: use request headers
  let origin: string;
  
  if (process.env.VERCEL_URL) {
    // We're on Vercel
    const protocol = process.env.VERCEL_ENV === "production" ? "https" : "http";
    origin = `${protocol}://${process.env.VERCEL_URL}`;
  } else {
    // Local development
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || request.nextUrl.host;
    origin = `${protocol}://${host}`;
  }

  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/bookmarks";

  console.log("🔐 Signin Route - Origin:", origin, "VERCEL_URL:", process.env.VERCEL_URL);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      `${origin}/?error=missing_config&message=Add+NEXT_PUBLIC_SUPABASE_URL+and+NEXT_PUBLIC_SUPABASE_ANON_KEY+to+.env.local.+See+SETUP_GUIDE.md`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error.message)}`
    );
  }

  if (!data?.url) {
    return NextResponse.redirect(
      `${origin}/?error=no_auth_url&message=Supabase+did+not+return+sign-in+URL.+Enable+Google+provider+in+Supabase+Auth+and+check+SETUP_GUIDE.md`
    );
  }

  return NextResponse.redirect(data.url);
}
