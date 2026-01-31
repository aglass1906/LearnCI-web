"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical, Key, Ban, Shield, ShieldOff, Trash, UserPlus, Pencil } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any | null;
    onPasswordChanged: () => void;
}

function ChangePasswordDialog({ open, onOpenChange, user, onPasswordChanged }: ChangePasswordDialogProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/admin/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.user_id, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to update password");
                return;
            }

            // Success
            alert(`Password updated successfully for ${user.name}`);
            setNewPassword("");
            setConfirmPassword("");
            onOpenChange(false);
            onPasswordChanged();
        } catch (err) {
            console.error("Error changing password:", err);
            setError("Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { label: "", color: "" };
        if (password.length < 6) return { label: "Too short", color: "text-red-500" };
        if (password.length < 8) return { label: "Weak", color: "text-orange-500" };
        if (password.length < 12) return { label: "Good", color: "text-yellow-500" };
        return { label: "Strong", color: "text-green-500" };
    };

    const strength = getPasswordStrength(newPassword);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Set a new password for {user?.name || "this user"}. They will need to use this password on their next login.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                disabled={loading}
                                required
                            />
                            {strength.label && (
                                <p className={`text-xs ${strength.color}`}>{strength.label}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                disabled={loading}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserCreated: () => void;
}

function CreateUserDialog({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleResetForm = () => {
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
        setIsAdmin(false);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!email || !name || !password) {
            setError("All fields are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid email format");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, password, isAdmin })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create user");
                return;
            }

            // Success
            alert(`User created successfully: ${email}`);
            handleResetForm();
            onOpenChange(false);
            onUserCreated();
        } catch (err) {
            console.error("Error creating user:", err);
            setError("Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { label: "", color: "" };
        if (password.length < 6) return { label: "Too short", color: "text-red-500" };
        if (password.length < 8) return { label: "Weak", color: "text-orange-500" };
        if (password.length < 12) return { label: "Good", color: "text-yellow-500" };
        return { label: "Strong", color: "text-green-500" };
    };

    const strength = getPasswordStrength(password);

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open) handleResetForm();
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account. The user will be able to log in immediately with the provided credentials.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-password">Password *</Label>
                            <Input
                                id="create-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                disabled={loading}
                                required
                            />
                            {strength.label && (
                                <p className={`text-xs ${strength.color}`}>{strength.label}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-confirm-password">Confirm Password *</Label>
                            <Input
                                id="create-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="admin-checkbox"
                                checked={isAdmin}
                                onCheckedChange={(checked: boolean) => setIsAdmin(checked)}
                                disabled={loading}
                            />
                            <Label htmlFor="admin-checkbox" className="font-normal cursor-pointer">
                                Make this user an admin
                            </Label>
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any | null;
    onUserUpdated: () => void;
}

function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setEmail(user.email || "");
            setName(user.name || "");
        }
    }, [user, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !name) {
            setError("All fields are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid email format");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/admin/update-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.user_id, email, name })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to update user");
                return;
            }

            alert(`User updated successfully`);
            onOpenChange(false);
            onUserUpdated();
        } catch (err) {
            console.error("Error updating user:", err);
            setError("Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User Details</DialogTitle>
                    <DialogDescription>
                        Update name and email. Changing email will update the login email as well.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email *</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                                disabled={loading}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}



import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Eye } from "lucide-react";

interface UserDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
}

function UserDetailsSheet({ open, onOpenChange, userId }: UserDetailsSheetProps) {
    const [data, setData] = useState<{ profile: any; auth: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && userId) {
            fetchUserDetails();
        } else {
            setData(null);
            setError("");
        }
    }, [open, userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user details");
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            console.error("Error fetching details:", err);
            setError(err.message || "Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    if (!userId) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could invoke a toast here
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    const DataRow = ({ label, value, copyable = false }: { label: string; value: any; copyable?: boolean }) => (
        <div className="flex flex-col py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
            <span className="text-xs font-medium text-muted-foreground uppercase mb-1">{label}</span>
            <div className="flex items-center justify-between group">
                <span className="text-sm break-all font-mono">{typeof value === 'object' ? JSON.stringify(value) : (value?.toString() || "N/A")}</span>
                {copyable && value && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(value.toString())}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );

    const JsonBlock = ({ data }: { data: any }) => (
        <pre className="bg-gray-100 dark:bg-zinc-900 p-2 rounded-md text-xs overflow-auto max-h-[300px]">
            {JSON.stringify(data, null, 2)}
        </pre>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>User Details</SheetTitle>
                    <SheetDescription>
                        Comprehensive data from Auth and Profile tables.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 h-full pb-10">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">Loading details...</div>
                    ) : error ? (
                        <div className="text-red-500 p-4 border border-red-200 rounded">{error}</div>
                    ) : data ? (
                        <Tabs defaultValue="profile" className="h-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="profile">Profile Data</TabsTrigger>
                                <TabsTrigger value="auth">Auth Data</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile" className="h-[calc(100vh-200px)]">
                                <ScrollArea className="h-full pr-4">
                                    <div className="space-y-4 pt-4">
                                        {data.profile ? (
                                            <>
                                                <DataRow label="Name" value={data.profile.username || data.profile.name} copyable />
                                                <DataRow label="Display Name" value={data.profile.display_name} />
                                                <DataRow label="Profile ID" value={data.profile.id} copyable />
                                                <DataRow label="User ID" value={data.profile.user_id} copyable />
                                                <DataRow label="Current Language" value={data.profile.current_language} />
                                                <DataRow label="Current Level" value={data.profile.current_level} />
                                                <DataRow label="Total Minutes" value={data.profile.total_minutes} />
                                                <DataRow label="Is Admin" value={data.profile.is_admin} />
                                                <DataRow label="Is Banned" value={data.profile.is_banned} />
                                                <div className="pt-4">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Full Profile Object</span>
                                                    <JsonBlock data={data.profile} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-10 text-muted-foreground">No Profile Record Found</div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="auth" className="h-[calc(100vh-200px)]">
                                <ScrollArea className="h-full pr-4">
                                    <div className="space-y-4 pt-4">
                                        <DataRow label="Email" value={data.auth.email} copyable />
                                        <DataRow label="Auth ID" value={data.auth.id} copyable />
                                        <DataRow label="Created At" value={formatDate(data.auth.created_at)} />
                                        <DataRow label="Last Sign In" value={formatDate(data.auth.last_sign_in_at)} />
                                        <DataRow label="Banned Until" value={formatDate(data.auth.banned_until)} />
                                        <DataRow label="Phone" value={data.auth.phone} />

                                        <div className="pt-4">
                                            <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Providers / Identities</span>
                                            {data.auth.identities?.map((id: any) => (
                                                <div key={id.identity_id} className="mb-2 p-2 px-3 bg-gray-50 dark:bg-zinc-800 rounded flex justify-between items-center">
                                                    <span className="capitalize text-sm font-medium">{id.provider}</span>
                                                    <span className="text-xs text-muted-foreground">{id.created_at ? new Date(id.created_at).toLocaleDateString() : ''}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-2">
                                            <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">User Metadata</span>
                                            <JsonBlock data={data.auth.user_metadata} />
                                        </div>

                                        <div className="pt-2">
                                            <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">App Metadata</span>
                                            <JsonBlock data={data.auth.app_metadata} />
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Dialog states
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Selection states
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const router = useRouter();
    const [supabase] = useState(() => createClient());

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setCurrentUserId(user.id);

        try {
            const response = await fetch("/api/admin/users");
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            setFetchError(error.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdminToggle = async (userId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setUsers(prev => prev.map(u =>
            u.user_id === userId ? { ...u, is_admin: newStatus } : u
        ));

        try {
            const response = await fetch("/api/admin/toggle-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isAdmin: newStatus })
            });

            if (!response.ok) {
                const { error } = await response.json();
                alert(error || "Failed to update admin status");
                // Revert
                setUsers(prev => prev.map(u =>
                    u.user_id === userId ? { ...u, is_admin: currentStatus } : u
                ));
            }
        } catch (error) {
            console.error("Error toggling admin:", error);
            alert("Failed to update admin status");
            // Revert
            setUsers(prev => prev.map(u =>
                u.user_id === userId ? { ...u, is_admin: currentStatus } : u
            ));
        }
    };

    const handleSuspendToggle = async (user: any) => {
        const isBanned = user.is_banned;
        const action = isBanned ? 'unsuspend' : 'suspend';
        const newStatus = !isBanned;

        setProcessingId(user.user_id);

        // Optimistic update
        setUsers(prev => prev.map(u =>
            u.user_id === user.user_id ? { ...u, is_banned: newStatus } : u
        ));

        try {
            const response = await fetch("/api/admin/suspend-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.user_id, action })
            });

            if (!response.ok) {
                const { error } = await response.json();
                alert(error || `Failed to ${action} user`);
                // Revert
                setUsers(prev => prev.map(u =>
                    u.user_id === user.user_id ? { ...u, is_banned: isBanned } : u
                ));
            } else {
                fetchData(); // Refresh to get exact dates if needed
            }
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            // Revert
            setUsers(prev => prev.map(u =>
                u.user_id === user.user_id ? { ...u, is_banned: isBanned } : u
            ));
        } finally {
            setProcessingId(null);
        }
    };

    const confirmDelete = (user: any) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setProcessingId(selectedUser.user_id);

        try {
            const response = await fetch("/api/admin/delete-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedUser.user_id })
            });

            if (!response.ok) {
                const { error } = await response.json();
                alert(error || "Failed to delete user");
            } else {
                // Remove from list
                setUsers(prev => prev.filter(u => u.user_id !== selectedUser.user_id));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        } finally {
            setProcessingId(null);
            setDeleteDialogOpen(false);
            setSelectedUser(null);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Users</h1>
                <Button onClick={() => setCreateUserDialogOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create User
                </Button>
            </div>

            {fetchError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 dark:bg-red-950/20 dark:border-red-900">
                    Error: {fetchError}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Stats</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.user_id} className={`bg-white border-b dark:bg-zinc-900 dark:border-zinc-800 ${user.is_banned ? 'opacity-75 bg-red-50 dark:bg-red-950/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name || "N/A"}</span>
                                                <span className="text-xs text-muted-foreground">{user.email || "No email"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={user.is_admin || false}
                                                    onCheckedChange={() => handleAdminToggle(user.user_id, user.is_admin)}
                                                    disabled={user.user_id === currentUserId || processingId === user.user_id}
                                                />
                                                <span className="text-xs">{user.is_admin ? "Admin" : "User"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_banned ? (
                                                <Badge variant="destructive">Suspended</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs space-y-1">
                                                <div>{user.current_language || "-"} ({user.current_level || "-"})</div>
                                                <div>{(user.total_minutes / 60).toFixed(1)} hrs</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelectedUser(user); setDetailsOpen(true); }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setSelectedUser(user); setPasswordDialogOpen(true); }}>
                                                        <Key className="mr-2 h-4 w-4" />
                                                        Change Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleSuspendToggle(user)} disabled={user.user_id === currentUserId}>
                                                        {user.is_banned ? (
                                                            <>
                                                                <Shield className="mr-2 h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Unsuspend User</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Ban className="mr-2 h-4 w-4 text-orange-600" />
                                                                <span className="text-orange-600">Suspend User</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => confirmDelete(user)}
                                                        disabled={user.user_id === currentUserId}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <CreateUserDialog
                open={createUserDialogOpen}
                onOpenChange={setCreateUserDialogOpen}
                onUserCreated={fetchData}
            />

            <ChangePasswordDialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
                user={selectedUser}
                onPasswordChanged={() => { }}
            />

            <EditUserDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                user={selectedUser}
                onUserUpdated={fetchData}
            />

            <UserDetailsSheet
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                userId={selectedUser?.user_id}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            <strong> {selectedUser?.name || selectedUser?.email} </strong>
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
