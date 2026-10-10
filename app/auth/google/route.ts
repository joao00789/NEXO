import { NextResponse } from "next/server";

import { getSafeNextPath } from "@/lib/auth/oauth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  callbackUrl.searchParams.set(
    "next",
    getSafeNextPath(requestUrl.searchParams.get("next")),
  );

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });

    if (error || !data.url) {
      console.error("Google OAuth initiation failed.", {
        code: error?.code ?? "missing_authorization_url",
      });
      return NextResponse.redirect(new URL("/login?error=google", requestUrl));
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error("Google OAuth initiation failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.redirect(new URL("/login?error=google", requestUrl));
  }
}
