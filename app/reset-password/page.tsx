"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, CheckCircle2, Key, ArrowLeft, Loader2, Zap } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const isRecoveryRequest = searchParams.get("type") === "recovery";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleRequestLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });
            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-[440px] z-10">
                <div className="glass-card rounded-2xl p-8 shadow-2xl text-center space-y-6 border-t-4 border-t-emerald-500">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    
                    {isRecoveryRequest ? (
                        <div className="space-y-2">
                            <h2 className="font-heading text-2xl font-extrabold text-white">Recovery Link Sent</h2>
                            <p className="text-white/60 font-sans text-sm">
                                We've sent a secure password reset link to <strong className="text-accentTeal">{email}</strong>
                            </p>
                            <p className="text-white/40 font-sans text-xs leading-relaxed pt-2">
                                Please check your inbox and click the link to configure a new access key.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h2 className="font-heading text-2xl font-extrabold text-white">Access Key Updated</h2>
                            <p className="text-white/60 font-sans text-sm">
                                Your password has been successfully updated.
                            </p>
                            <p className="text-white/40 font-sans text-xs leading-relaxed pt-2">
                                Redirecting you back to the login terminal...
                            </p>
                        </div>
                    )}

                    <button 
                        onClick={() => router.push("/login")}
                        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-labels text-[10px] font-extrabold tracking-wider transition-all"
                    >
                        BACK TO LOGIN
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[440px] z-10 animate-float">
            
            {/* Brand Header */}
            <div className="flex flex-col items-center mb-8">
                <h1 className="font-heading text-5xl font-extrabold text-primaryAccent tracking-tighter mb-1.5">LearnCI</h1>
                <p className="font-labels text-[10px] text-white/40 tracking-widest uppercase">LANGUAGE OPERATIVE ACCESS</p>
            </div>

            {/* Glass Card */}
            <div className="glass-card rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6">
                
                {/* Graphic Icon */}
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primaryAccent/10 border border-primaryAccent/20 shadow-lg shadow-primaryAccent/5">
                    {isRecoveryRequest ? (
                        <Lock className="h-6 w-6 text-primaryAccent" />
                    ) : (
                        <Key className="h-6 w-6 text-primaryAccent" />
                    )}
                </div>

                {/* Content Header */}
                <div className="text-center space-y-1.5">
                    <h2 className="font-heading text-2xl font-extrabold text-white">
                        {isRecoveryRequest ? "Reset Your Password" : "Configure Access Key"}
                    </h2>
                    <p className="text-white/60 font-sans text-xs leading-normal max-w-xs mx-auto">
                        {isRecoveryRequest 
                            ? "Enter your email address and we'll send you a secure link to get back into your account."
                            : "Set a new secure password to restore access to your learning portal."
                        }
                    </p>
                </div>

                {/* Forms */}
                {isRecoveryRequest ? (
                    /* 1. Request Link Form */
                    <form onSubmit={handleRequestLink} className="w-full space-y-6">
                        <div className="space-y-2">
                            <label className="font-labels text-[10px] font-bold tracking-wider text-white/50 ml-1" htmlFor="email">
                                EMAIL ADDRESS
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-accentTeal focus-within:ring-2 focus-within:ring-accentTeal/20 transition-all">
                                <Mail className="h-4 w-4 text-white/30 mr-3" />
                                <input 
                                    id="email"
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agent@learnci.net" 
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 py-3 text-sm text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-lg font-sans">
                                {error}
                            </p>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primaryAccent text-brandDark font-labels text-[10px] font-extrabold tracking-wider py-3.5 rounded-xl shadow-lg shadow-primaryAccent/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            <span>{loading ? "SENDING LINK..." : "SEND RECOVERY LINK"}</span>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-brandDark" />
                            ) : (
                                <ArrowRight className="h-4 w-4 text-brandDark group-hover:translate-x-1 transition-transform" />
                            )}
                        </button>
                    </form>
                ) : (
                    /* 2. Update Password Form */
                    <form onSubmit={handleUpdatePassword} className="w-full space-y-5">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="font-labels text-[10px] font-bold tracking-wider text-white/50 ml-1" htmlFor="password">
                                NEW ACCESS KEY
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-accentTeal focus-within:ring-2 focus-within:ring-accentTeal/20 transition-all">
                                <Lock className="h-4 w-4 text-white/30 mr-3" />
                                <input 
                                    id="password"
                                    type="password" 
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 py-3 text-sm text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="font-labels text-[10px] font-bold tracking-wider text-white/50 ml-1" htmlFor="confirm">
                                CONFIRM ACCESS KEY
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-accentTeal focus-within:ring-2 focus-within:ring-accentTeal/20 transition-all">
                                <Lock className="h-4 w-4 text-white/30 mr-3" />
                                <input 
                                    id="confirm"
                                    type="password" 
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 py-3 text-sm text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 px-3 py-2 rounded-lg font-sans">
                                {error}
                            </p>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primaryAccent text-brandDark font-labels text-[10px] font-extrabold tracking-wider py-3.5 rounded-xl shadow-lg shadow-primaryAccent/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            <span>{loading ? "CONFIGURING ACCESS KEY..." : "CONFIGURE ACCESS KEY"}</span>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-brandDark" />
                            ) : (
                                <Zap className="h-4 w-4 fill-brandDark" />
                            )}
                        </button>
                    </form>
                )}

                {/* Back to Sign In Footer Link */}
                <div className="pt-4 border-t border-white/5 w-full text-center">
                    <Link href="/login" className="text-white/40 hover:text-primaryAccent font-labels text-[9px] font-bold tracking-wider transition-colors inline-flex items-center justify-center gap-2">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        BACK TO SIGN IN
                    </Link>
                </div>

            </div>

            {/* System Status Footer */}
            <div className="mt-8 flex justify-between items-center px-4 opacity-40">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-labels text-[9px] tracking-widest text-white uppercase">UPLINK ACTIVE</span>
                </div>
                <span className="font-labels text-[9px] tracking-widest text-white uppercase">v4.2.0-SIGMA</span>
            </div>

        </div>
    );
}

export default function ResetPassword() {
    return (
        <div className="relative min-h-screen bg-[linear-gradient(135deg,#0b0e19_0%,#1c1f2b_50%,#10131f_100%)] flex flex-col items-center justify-center p-6 overflow-hidden">
            
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primaryAccent/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accentTeal/5 rounded-full blur-[150px] pointer-events-none"></div>

            <Suspense fallback={
                <div className="w-full max-w-[440px] z-10 animate-float text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primaryAccent mx-auto" />
                    <p className="font-labels text-[10px] tracking-widest text-white/40 uppercase">Loading recovery portal...</p>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
