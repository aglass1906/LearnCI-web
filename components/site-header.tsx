"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function SiteHeader() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = async (currentUser: User) => {
        try {
            const { data } = await supabase
                .from("profiles")
                .select("name, current_language, is_admin")
                .eq("user_id", currentUser.id)
                .single();
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        const initUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                await fetchProfile(user);
            }
            setLoading(false);
        };

        initUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                await fetchProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
            } else if (session?.user) {
                // Token refresh etc
                setUser(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isAdmin = profile?.is_admin || false;

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
                    {loading ? (
                        <div className="w-20 h-8 bg-muted animate-pulse rounded" />
                    ) : user ? (
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
                                    {getFlag(profile?.current_language)}
                                </span>
                            </div>

                            {profile?.name && (
                                <Link href={`/u/${profile.name}`}>
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
