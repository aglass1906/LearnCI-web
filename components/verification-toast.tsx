"use client";

import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export function VerificationToast() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            // Show success toast
            setTimeout(() => {
                toast({
                    title: "Email Verified Successfully!",
                    description: "Welcome to LearnCI. Your account is now active.",
                    variant: "default",
                    className: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/30 dark:border-green-900 dark:text-green-100",
                });
            }, 500);

            // Clean up the URL
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("verified");
            // Replace the URL without refreshing the page
            window.history.replaceState(null, "", `${window.location.pathname}?${newParams.toString()}`);
        }
    }, [searchParams, toast]);

    return null;
}
