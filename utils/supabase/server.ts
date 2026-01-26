import { createServerClient, type CookieOptions } from '@supabase/ssr'

// We define a broad type for cookieStore to avoid tight coupling with Next.js types in this utility
// but it should match the shape of ReadonlyRequestCookies
export function createClient(cookieStore: any) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
                    try {
                        cookiesToSet.forEach(
                            ({ name, value, options }: { name: string; value: string; options?: CookieOptions }) =>
                                cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}

// Admin client with service role key for admin operations
export async function createAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return []
                },
                setAll(cookiesToSet: any[]) {
                    // Do nothing
                },
            },
        }
    )
}
