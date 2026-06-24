import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getDashboardPath } from "@/lib/navigation";
import { getSupabaseEnv } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole, Database } from "@/types/database";

const protectedPrefixes = [
  "/manager",
  "/member",
  "/meals",
  "/deposits",
  "/expenses",
  "/notifications",
  "/members",
  "/reports",
  "/profile",
  "/settings",
  "/onboarding"
];

const authPrefixes = ["/login", "/register"];

function isPrefixed(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function getProfileRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AppRole | null> {
  const { data } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  return data?.role ?? null;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = isPrefixed(pathname, protectedPrefixes);
  const isAuthRoute = isPrefixed(pathname, authPrefixes);

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!user) {
    return response;
  }

  const role = await getProfileRole(supabase, user.id);

  if (isAuthRoute && role) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getDashboardPath(role);
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/manager") && role !== "manager") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role ? getDashboardPath(role) : "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/member") && role !== "member") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role ? getDashboardPath(role) : "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
