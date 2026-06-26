import { PortalSidebar } from "@/components/portal-sidebar";
import { VerificationToast } from "@/components/verification-toast";
import { Suspense } from "react";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-brandDark text-white relative overflow-hidden">
            
            {/* Atmospheric Background Glows for Portal Space */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(56,97,251,0.08)_0%,rgba(56,97,251,0)_70%)] blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,rgba(0,229,255,0)_70%)] blur-[120px]"></div>
            </div>

            {/* Sidebar with elevated layering */}
            <PortalSidebar className="relative z-20" />
            
            {/* Main content viewport */}
            <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 w-full max-w-7xl mx-auto relative z-10">
                <Suspense fallback={null}>
                    <VerificationToast />
                </Suspense>
                {children}
            </main>
        </div>
    );
}
