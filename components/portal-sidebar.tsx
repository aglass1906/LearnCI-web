"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    MessageSquare,
    Activity,
    Library,
    GraduationCap,
    Menu,
    User,
    LogOut,
    Heart,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const sidebarLinks = [
    {
        title: "Dashboard",
        href: "/portal",
        icon: LayoutDashboard,
    },
    {
        title: "Coaching",
        href: "/portal/check-in-history",
        icon: MessageSquare,
    },
    {
        title: "Activities",
        href: "/portal/activities",
        icon: Activity,
    },
    {
        title: "Library",
        href: "/portal/library",
        icon: Library,
    },
    {
        title: "Stories",
        href: "/portal/stories",
        icon: BookOpen,
    },
    {
        title: "Favorites",
        href: "/portal/favorites",
        icon: Heart,
    },
    {
        title: "Learning",
        href: "/portal/learning",
        icon: GraduationCap,
    },
    {
        title: "Profile",
        href: "/portal/profile",
        icon: User,
    },
];

interface PortalSidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function PortalSidebar({ className, ...props }: PortalSidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-40 text-white hover:bg-white/10">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] p-0 bg-brandDark/95 border-r border-white/10 backdrop-blur-md">
                    <SidebarContent pathname={pathname} setOpen={setOpen} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className={cn("hidden md:flex flex-col h-screen border-r border-white/5 bg-brandDark/40 backdrop-blur-md w-64 shrink-0", className)} {...props}>
                <SidebarContent pathname={pathname} />
            </div>
        </>
    );
}

interface SidebarContentProps {
    pathname: string;
    setOpen?: (open: boolean) => void;
}

function SidebarContent({ pathname, setOpen }: SidebarContentProps) {
    return (
        <div className="flex flex-col h-full py-6 text-white">
            <div className="px-6 py-2 mb-4">
                <h2 className="font-heading text-2xl font-extrabold tracking-tighter text-primaryAccent">LearnCI</h2>
                <p className="font-labels text-[9px] text-white/30 tracking-widest uppercase mt-0.5">Operative Portal</p>
            </div>
            <div className="flex-1 py-2">
                <nav className="grid gap-1.5 px-3">
                    {sidebarLinks.map((link, index) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={index}
                                href={link.href}
                                onClick={() => setOpen?.(false)}
                                className={cn(
                                    "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 font-sans",
                                    isActive 
                                        ? "bg-white/10 text-primaryAccent shadow-lg shadow-black/20 border border-white/5 font-semibold" 
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn("h-4.5 w-4.5 transition-transform duration-200", isActive ? "text-primaryAccent scale-110" : "text-white/40")} />
                                <span className={isActive ? "translate-x-0.5 transition-transform" : ""}>{link.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="px-4 py-4 border-t border-white/5 mt-auto">
                <form action="/auth/signout" method="post">
                    <Button 
                        variant="ghost" 
                        type="submit"
                        className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium text-sm"
                    >
                        <LogOut className="h-4.5 w-4.5 text-red-400/70" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </div>
    );
}
