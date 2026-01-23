"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, Plus, X } from "lucide-react";
import EditResourceDialog from "./EditResourceDialog";
import { deleteResource } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function LibraryManager({ initialResources }: { initialResources: Resource[] }) {
    const { toast } = useToast();
    const [resources, setResources] = useState<Resource[]>(initialResources);

    useEffect(() => {
        setResources(initialResources);
    }, [initialResources]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

    // derived constants
    const allTags = Array.from(new Set(resources.flatMap(r => r.tags || []))).sort();
    const languages = [
        { code: "es", label: "Spanish" },
        { code: "ja", label: "Japanese" },
        { code: "ko", label: "Korean" },
        { code: "fr", label: "French" },
    ];

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedLanguage("all");
        setSelectedTags([]);
    };

    const hasActiveFilters = searchTerm || selectedLanguage !== "all" || selectedTags.length > 0;

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLanguage = selectedLanguage === "all" || resource.language === selectedLanguage;
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => resource.tags?.includes(tag));

        return matchesSearch && matchesLanguage && matchesTags;
    });

    const handleDeleteClick = (resource: Resource) => {
        setResourceToDelete(resource);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!resourceToDelete) return;

        const result = await deleteResource(resourceToDelete.id);
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Resource deleted successfully.",
            });
        }
        setIsDeleteDialogOpen(false);
        setResourceToDelete(null);
    };

    const handleCreateClick = () => {
        setEditingResource(null); // Ensure no resource is selected for creating
        setIsDialogOpen(true);
    };

    const handleEditClick = (resource: Resource) => {
        setEditingResource(resource);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex flex-1 gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or author..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="w-[180px]">
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Languages</SelectItem>
                                    {languages.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <Button onClick={handleCreateClick} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Resource
                    </Button>
                </div>

                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                                onClick={() => toggleTag(tag)}
                            >
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredResources.length > 0 ? (
                            filteredResources.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">
                                        <div>{resource.title}</div>
                                        <div className="text-sm text-muted-foreground">{resource.author}</div>
                                    </TableCell>
                                    <TableCell className="capitalize">{resource.type}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{resource.difficulty}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={resource.status === 'published' ? 'default' : 'secondary'}>
                                            {resource.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">{resource.language}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(resource)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(resource)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No resources found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditResourceDialog
                resource={editingResource}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the resource
                            "{resourceToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
