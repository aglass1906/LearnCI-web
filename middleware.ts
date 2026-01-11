import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected Admin Routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Check admin access: first check env var, then database
        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
        const isEnvAdmin = user.email && (adminEmails.includes(user.email) || adminEmails.includes("*"));

        if (!isEnvAdmin) {
            // Check database for is_admin flag
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("user_id", user.id)
                .single();

            if (!profile?.is_admin) {
                // Not authorized
                return NextResponse.redirect(new URL("/", request.url));
            }
        }
    }

    // Protected Portal Routes
    if (request.nextUrl.pathname.startsWith("/portal") && !user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
