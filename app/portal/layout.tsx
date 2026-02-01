import { PortalSidebar } from "@/components/portal-sidebar";
import { VerificationToast } from "@/components/verification-toast";
import { Suspense } from "react";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <PortalSidebar />
            <main className="flex-1 p-6 md:p-8 pt-14 md:pt-8 w-full max-w-7xl mx-auto">
                <Suspense fallback={null}>
                    <VerificationToast />
                </Suspense>
                {children}
            </main>
        </div>
    );
}
