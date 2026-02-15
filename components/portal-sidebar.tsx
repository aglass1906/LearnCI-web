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
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-40">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] p-0">
                    <SidebarContent pathname={pathname} setOpen={setOpen} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className={cn("hidden md:flex flex-col h-screen border-r bg-background w-64", className)} {...props}>
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
        <div className="flex flex-col h-full py-4">
            <div className="px-6 py-2">
                <h2 className="text-lg font-semibold tracking-tight">Portal</h2>
            </div>
            <div className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarLinks.map((link, index) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={index}
                                href={link.href}
                                onClick={() => setOpen?.(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="px-2 py-2 border-t mt-auto">
                <form action="/auth/signout" method="post">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </div>
    );
}
