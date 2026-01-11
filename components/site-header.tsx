import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { User as UserIcon } from "lucide-react";

export async function SiteHeader() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profileName = null;
    let currentLanguage = null;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("name, current_language")
            .eq("user_id", user.id)
            .single();
        profileName = profile?.name;
        currentLanguage = profile?.current_language;
    }

    const isAdmin = user?.email && (process.env.ADMIN_EMAILS?.split(",") || []).includes(user.email);

    const getFlag = (lang: string | null) => {
        if (!lang) return "🌐";
        const lower = lang.toLowerCase();
        if (lower.includes("spanish")) return "🇪🇸";
        if (lower.includes("japanese")) return "🇯🇵";
        if (lower.includes("korean")) return "🇰🇷";
        if (lower.includes("french")) return "🇫🇷";
        if (lower.includes("german")) return "🇩🇪";
        if (lower.includes("italian")) return "🇮🇹";
        if (lower.includes("chinese")) return "🇨🇳";
        if (lower.includes("portuguese")) return "🇧🇷";
        if (lower.includes("russian")) return "🇷🇺";
        return "🌐";
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <span className="bg-primary text-primary-foreground rounded-lg px-2 py-1">CI</span>
                    LearnCI
                </Link>
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                                        Admin
                                    </Button>
                                </Link>
                            )}

                            <Link href="/portal">
                                <Button variant="ghost" size="sm">
                                    Portal
                                </Button>
                            </Link>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                                <span className="text-xl leading-none" role="img" aria-label="Current Language">
                                    {getFlag(currentLanguage)}
                                </span>
                            </div>

                            {profileName && (
                                <Link href={`/u/${profileName}`}>
                                    <Button variant="ghost" size="icon" title="Your Profile">
                                        <UserIcon className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                    )}
                    <Button size="sm">Download App</Button>
                </nav>
            </div>
        </header>
    );
}
