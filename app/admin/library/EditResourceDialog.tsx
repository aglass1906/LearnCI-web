"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { updateResource, createResource } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Resource {
    id: string;
    type: string;
    title: string;
    author: string;
    description: string;
    cover_image_url: string;
    main_url: string;
    difficulty: string;
    tags: string[];
    avg_rating: number;
    language: string;
    status: string;
    is_featured: boolean;
}

interface EditResourceDialogProps {
    resource?: Resource | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function EditResourceDialog({ resource, open, onOpenChange, onSuccess }: EditResourceDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Resource>>(
        resource || {
            type: "book",
            title: "",
            author: "",
            description: "",
            cover_image_url: "",
            main_url: "",
            difficulty: "beginner",
            tags: [],
            language: "es",
            status: "draft",
            is_featured: false,
        }
    );

    // Update form data when resource changes
    if (resource && resource.id !== formData.id) {
        setFormData(resource);
    }

    // Reset if opening in create mode
    if (!resource && formData.id) {
        setFormData({
            type: "book",
            title: "",
            author: "",
            description: "",
            cover_image_url: "",
            main_url: "",
            difficulty: "beginner",
            tags: [],
            language: "es",
            status: "draft",
            is_featured: false,
        });
    }


    const handleChange = (key: keyof Resource, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                // Ensure tags is an array if it matches a string (simple CSV handling)
                tags: typeof formData.tags === 'string'
                    ? (formData.tags as string).split(',').map((t: string) => t.trim())
                    : formData.tags
            };

            let result;
            if (resource?.id) {
                result = await updateResource(resource.id, dataToSubmit);
            } else {
                result = await createResource(dataToSubmit);
            }

            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                });
            } else {
                toast({
                    title: "Success",
                    description: resource ? "Resource updated successfully." : "Resource created successfully.",
                });
                onOpenChange(false);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{resource ? "Edit Resource" : "Create Resource"}</DialogTitle>
                    <DialogDescription>
                        Make changes to the library resource here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title || ""}
                                onChange={(e) => handleChange("title", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input
                                id="author"
                                value={formData.author || ""}
                                onChange={(e) => handleChange("author", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="book">Book</SelectItem>
                                    <SelectItem value="podcast">Podcast</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="article">Article</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                                value={formData.difficulty}
                                onValueChange={(value) => handleChange("difficulty", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={formData.language}
                                onValueChange={(value) => handleChange("language", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="ja">Japanese</SelectItem>
                                    <SelectItem value="ko">Korean</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="main_url">Main URL</Label>
                        <Input
                            id="main_url"
                            value={formData.main_url || ""}
                            onChange={(e) => handleChange("main_url", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cover_image_url">Cover Image URL</Label>
                        <Input
                            id="cover_image_url"
                            value={formData.cover_image_url || ""}
                            onChange={(e) => handleChange("cover_image_url", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags}
                            onChange={(e) => handleChange("tags", e.target.value.split(",").map(s => s.trim()))}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="is_featured"
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => handleChange("is_featured", checked)}
                        />
                        <Label htmlFor="is_featured">Featured Resource</Label>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
