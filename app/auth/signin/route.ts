import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = request.nextUrl.origin;
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/bookmarks";

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
