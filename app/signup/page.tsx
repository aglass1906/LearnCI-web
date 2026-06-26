"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const redirectUrl = `${window.location.origin}/auth/callback?next=/auth/verified`;

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        full_name: name,
                    }
                }
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/portal`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (success) {
        return (
            <div className="relative min-h-screen bg-[linear-gradient(135deg,#0b0e19_0%,#1c1f2b_50%,#10131f_100%)] flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accentTeal/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="w-full max-w-[440px] z-10 animate-float">
                    <div className="glass-card rounded-2xl p-8 shadow-2xl text-center space-y-6 border-t-4 border-t-emerald-500">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="font-heading text-2xl font-extrabold text-white">Check Your Email</h2>
                            <p className="text-white/60 font-sans text-sm">
                                We've sent a verification link to <strong className="text-accentTeal">{email}</strong>
                            </p>
                        </div>

                        <p className="text-white/40 font-sans text-xs leading-relaxed">
                            Click the link in the email to verify your account. Once verified, you can sign in to the portal.
                        </p>

                        <button 
                            onClick={() => router.push("/login")}
                            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-labels text-[10px] font-extrabold tracking-wider transition-all"
                        >
                            BACK TO LOGIN
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[linear-gradient(135deg,#0b0e19_0%,#1c1f2b_50%,#10131f_100%)] flex flex-col items-center justify-center p-6 overflow-hidden">
            
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primaryAccent/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accentTeal/5 rounded-full blur-[150px] pointer-events-none"></div>

            {/* Content Container */}
            <div className="w-full max-w-[440px] z-10 animate-float">
                
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <h1 className="font-heading text-5xl font-extrabold text-primaryAccent tracking-tighter mb-1.5">LearnCI</h1>
                    <p className="font-labels text-[10px] text-white/40 tracking-widest uppercase">LANGUAGE OPERATIVE ACCESS</p>
                </div>

                {/* Glass Card */}
                <div className="glass-card rounded-2xl p-8 shadow-2xl">
                    
                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 bg-brandDark/50 p-1 rounded-xl border border-white/5">
                        <Link href="/login" className="flex-grow text-center py-2.5 rounded-lg font-labels text-[10px] font-bold tracking-wider text-white/40 hover:text-white transition-all">
                            SIGN IN
                        </Link>
                        <button className="flex-grow py-2.5 rounded-lg font-labels text-[10px] font-bold tracking-wider text-white bg-white/10 border border-white/5 transition-all">
                            CREATE ACCOUNT
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        
                        {/* Full name field */}
                        <div className="space-y-2.5">
                            <label className="font-labels text-[10px] font-bold tracking-wider text-white/50 ml-1">
                                FULL NAME
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-accentTeal focus-within:ring-2 focus-within:ring-accentTeal/20 transition-all">
                                <User className="h-4 w-4 text-white/30 mr-3" />
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Agent Name" 
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 py-3 text-sm text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Email field */}
                        <div className="space-y-2.5">
                            <label className="font-labels text-[10px] font-bold tracking-wider text-white/50 ml-1">
                                IDENTIFICATION (EMAIL)
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-accentTeal focus-within:ring-2 focus-within:ring-accentTeal/20 transition-all">
                                <Mail className="h-4 w-4 text-white/30 mr-3" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agent@learnci.net" 
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 py-3 text-sm text-white placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2.5">
                            <label className="font-labels text-[10px] font-bold tracking-wider text-white/50 ml-1">
                                ACCESS KEY (PASSWORD)
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-accentTeal focus-within:ring-2 focus-within:ring-accentTeal/20 transition-all">
                                <Lock className="h-4 w-4 text-white/30 mr-3" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" 
                                    className="w-full bg-transparent border-none outline-none focus:ring-0 py-3 text-sm text-white placeholder:text-white/20"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-white/30 hover:text-primaryAccent transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password field */}
                        <div className="space-y-2.5">
                            <label className="font-labels text-[10px] font-bold tracking-wider text-white/50 ml-1">
                                CONFIRM ACCESS KEY
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-accentTeal focus-within:ring-2 focus-within:ring-accentTeal/20 transition-all">
                                <Lock className="h-4 w-4 text-white/30 mr-3" />
                                <input 
                                    type={showPassword ? "text" : "password"}
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

                        {/* Submit CTA Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3.5 mt-2 rounded-xl bg-primaryAccent text-brandDark shadow-lg shadow-primaryAccent/25 hover:scale-[1.02] active:scale-[0.98] transition-all font-heading text-sm font-extrabold tracking-wider flex items-center justify-center gap-2"
                        >
                            <span>{loading ? "CREATING OPERATIVE..." : "CREATE OPERATIVE"}</span>
                            <Zap className="h-4 w-4 fill-brandDark" />
                        </button>

                        {/* Divider */}
                        <div className="flex className-center gap-4 py-1">
                            <div className="h-[1px] flex-grow bg-white/5"></div>
                            <span className="font-labels text-[9px] text-white/30 uppercase tracking-widest">External Protocol</span>
                            <div className="h-[1px] flex-grow bg-white/5"></div>
                        </div>

                        {/* Google Auth */}
                        <button 
                            type="button" 
                            onClick={handleGoogleSignIn}
                            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-sans text-sm font-medium flex items-center justify-center gap-3 transition-all group"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="#EA4335"></path>
                            </svg>
                            Sign Up with Google
                        </button>

                    </form>
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
        </div>
    );
}
