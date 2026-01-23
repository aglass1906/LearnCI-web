"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Book, Headphones, MonitorPlay, Globe, ExternalLink, Star, Search, X } from "lucide-react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
}

interface LibraryClientProps {
    initialResources: Resource[] | null;
}


export default function LibraryClient({ initialResources }: LibraryClientProps) {
    const [resources] = useState<Resource[]>(initialResources || []);
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
        setActiveTab("all");
    };

    const hasActiveFilters = searchTerm || selectedLanguage !== "all" || selectedTags.length > 0 || activeTab !== "all";

    const filteredResources = resources.filter(resource => {
        const matchesTab = activeTab === "all" || resource.type.toLowerCase() === activeTab.toLowerCase();
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLanguage = selectedLanguage === "all" || resource.language === selectedLanguage;
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => resource.tags?.includes(tag));

        return matchesTab && matchesSearch && matchesLanguage && matchesTags;
    });

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "podcast": return <Headphones className="h-4 w-4" />;
            case "video":
            case "youtube": return <MonitorPlay className="h-4 w-4" />;
            case "book": return <Book className="h-4 w-4" />;
            case "website": return <Globe className="h-4 w-4" />;
            default: return <Book className="h-4 w-4" />;
        }
    };


    // if (loading) {
    //     return (
    //         <div className="flex justify-center p-8">
    //             <Loader2 className="animate-spin text-muted-foreground" />
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-6 pb-20 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Library</h1>
                <p className="text-muted-foreground">Curated resources to supercharge your learning.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or author..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                </div>

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
            </div>

            <Tabs defaultValue="all" value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="mb-6 flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">
                        All Resources
                    </TabsTrigger>
                    <TabsTrigger value="podcast" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">
                        Podcasts
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">
                        YouTube
                    </TabsTrigger>
                    <TabsTrigger value="book" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">
                        Books
                    </TabsTrigger>
                    <TabsTrigger value="website" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">
                        Websites
                    </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <Card key={resource.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all group">
                            <div className="relative h-48 w-full bg-slate-900 flex items-center justify-center">
                                {resource.cover_image_url ? (
                                    <div className="relative h-full w-full p-2">
                                        <Image
                                            src={resource.cover_image_url}
                                            alt={resource.title}
                                            fill
                                            style={{ objectFit: "contain" }}
                                            className="transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-800">
                                        {getTypeIcon(resource.type)}
                                    </div>
                                )}
                                <Badge className="absolute top-2 right-2 bg-background/90 text-foreground backdrop-blur-sm shadow-sm hover:bg-background/90 z-10">
                                    {getTypeIcon(resource.type)}
                                    <span className="ml-1 capitalize">{resource.type}</span>
                                </Badge>
                            </div>

                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="line-clamp-1 text-lg">{resource.title}</CardTitle>
                                    <Badge variant="outline" className="shrink-0">{resource.difficulty}</Badge>
                                </div>
                                <CardDescription className="font-medium text-primary">
                                    {resource.author}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 pb-2">
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                    {resource.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {resource.tags?.map((tag, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2 border-t bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{resource.avg_rating}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="gap-1 hover:text-primary" asChild>
                                        <a href={resource.main_url} target="_blank" rel="noopener noreferrer">
                                            Open <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No resources found in this category yet.</p>
                    </div>
                )}
            </Tabs>
        </div>
    );
}
