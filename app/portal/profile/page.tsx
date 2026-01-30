"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Mail, MapPin, Globe, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
    const supabase = createClient();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        location: "",
        website: "", // Assuming website or similar field might exist or just as placeholder
    });

    const fetchProfile = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
            } else {
                // @ts-ignore
                setProfile(data);
                const profileData = data as any;
                setFormData({
                    full_name: profileData.full_name || "",
                    location: profileData.location || "",
                    website: "", // Add field if exists in schema
                });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { error } = await supabase
                .from("profiles")
                // @ts-ignore
                .update({
                    full_name: formData.full_name,
                    location: formData.location,
                    updated_at: new Date().toISOString(),
                } as any)
                .eq("user_id", session.user.id);

            if (error) throw error;

            toast({
                title: "Profile updated",
                description: "Your profile information has been saved.",
            });
            fetchProfile();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback className="text-lg">
                                    {profile?.full_name?.substring(0, 2).toUpperCase() || "ME"}
                                </AvatarFallback>
                            </Avatar>
                            {/* Upload button could go here */}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    value={profile?.email || ""}
                                    className="pl-9"
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="pl-9"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="pl-9"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        <Button onClick={handleUpdate} disabled={updating}>
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Stats</CardTitle>
                            <CardDescription>Your current progress summary.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-secondary/50 border">
                                    <div className="text-2xl font-bold">{profile?.total_minutes || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase font-medium">Total Minutes</div>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/50 border">
                                    <div className="text-2xl font-bold">{profile?.current_level || "A1"}</div>
                                    <div className="text-xs text-muted-foreground uppercase font-medium">Current Level</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription</CardTitle>
                            <CardDescription>Manage your subscription plan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 p-3 border rounded-lg mb-4">
                                <div className="bg-primary/10 p-2 rounded-full text-primary">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-medium">Free Plan</div>
                                    <div className="text-xs text-muted-foreground">Basic features included</div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">Upgrade Plan</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
