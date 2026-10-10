import { NextResponse } from "next/server";

import { getSafeNextPath } from "@/lib/auth/oauth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google", requestUrl));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Google OAuth callback failed.", {
        code: error.code ?? "unknown",
      });
      return NextResponse.redirect(new URL("/login?error=google", requestUrl));
    }

    return NextResponse.redirect(new URL(nextPath, requestUrl));
  } catch (error) {
    console.error("Google OAuth callback failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.redirect(new URL("/login?error=google", requestUrl));
  }
}
