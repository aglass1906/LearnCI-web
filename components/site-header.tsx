"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { User as UserIcon, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function SiteHeader() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    const fetchProfile = async (currentUser: User) => {
        try {
            // Attempt to fetch profile with loose selection since schema is murky
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", currentUser.id)
                .single();

            if (error) {
                console.warn("Header profile fetch warning:", error);
            }
            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        const initUser = async () => {
            // Get session instead of just user for fresher state
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user || null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser);
            }
            setLoading(false);
        };

        initUser();

        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                await fetchProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                router.refresh(); // Refresh to clear server state if needed
            } else if (session?.user) {
                setUser(session.user);
            }
        });

        return () => {
            data.subscription.unsubscribe();
        };
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        router.push("/");
    };

    const isAdmin = profile?.is_admin || false;
    const displayName = profile?.name || profile?.full_name || profile?.username || user?.email?.split('@')[0] || "User";
    const avatarUrl = profile?.avatar_url;

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
        if (lower.includes("portuguese")) return "🇧🇷";
        if (lower.includes("russian")) return "🇷🇺";
        if (lower.includes("vietnamese")) return "🇻🇳";
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
                                    <Button variant="ghost" size="sm" className="hidden md:inline-flex text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                                        Admin
                                    </Button>
                                </Link>
                            )}

                            <Link href="/portal">
                                <Button variant="ghost" size="sm">
                                    Portal
                                </Button>
                            </Link>

                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                                <span className="text-xl leading-none" role="img" aria-label="Current Language">
                                    {getFlag(profile?.current_language)}
                                </span>
                            </div>

                            {/* User Menu Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={avatarUrl} alt={displayName} />
                                            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{displayName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/portal/profile" className="cursor-pointer">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/portal" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="cursor-pointer text-red-500">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Admin Panel</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline" size="sm">
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
