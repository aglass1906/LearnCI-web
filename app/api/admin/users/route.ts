import { createClient, createAdminClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // 1. Authorization Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isEnvAdmin = user.email && (adminEmails.includes(user.email) || adminEmails.includes("*"));

    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

    if (!isEnvAdmin && !currentUserProfile?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const adminSupabase = await createAdminClient();

        // 2. Fetch all profiles from DB
        const { data: profiles, error: profileError } = await adminSupabase
            .from("profiles")
            .select("*")
            .order("updated_at", { ascending: false });

        if (profileError) throw profileError;

        // 3. Fetch all users from Auth API
        // Note: This fetches up to 1000 users. For larger apps, allow pagination params.
        const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers({
            perPage: 1000
        });

        if (authError) throw authError;

        // 4. Merge data
        // Create a map of auth data for quick lookup
        const authMap = new Map<string, any>((authUsers || []).map(u => [u.id, u]));

        const enrichedUsers = (profiles || []).map(profile => {
            const authUser = authMap.get(profile.user_id);
            return {
                ...profile,
                email: authUser?.email, // Source of truth is auth.users
                is_banned: authUser?.banned_until ? new Date(authUser.banned_until) > new Date() : false,
                banned_until: authUser?.banned_until,
                last_sign_in_at: authUser?.last_sign_in_at,
                created_at: authUser?.created_at,
                auth_id: authUser?.id // Should match user_id
            };
        });

        // Optional: Also check for auth users who have NO profile (orphaned users)
        // and append them? For now, we only show profiles + enriched data.

        return NextResponse.json(enrichedUsers);

    } catch (error: any) {
        console.error("Error fetching admin users:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
