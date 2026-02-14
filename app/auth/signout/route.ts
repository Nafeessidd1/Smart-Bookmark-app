import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  });
}
