import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ArrowLeft, Book, Headphones, MonitorPlay, Globe, FileText, ExternalLink, Star, Timer } from "lucide-react";
import Link from "next/link";
import { extractVideoId } from "@/utils/youtube";

import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface ResourceLink {
    type: string;
    url: string;
    label: string;
    order: number;
    isActive: boolean;
}

export default async function ResourceDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: resource, error } = await supabase
        .from("learning_resources")
        .select("*")
        .eq("id", id)
        .eq("status", "published") // Ensure only published resources are visible
        .single();

    if (error || !resource) {
        if (error) console.error("Error fetching resource:", error);
        notFound();
    }

    // Fetch user favorites to determine initial state
    const { data: { user } } = await supabase.auth.getUser();
    let favoritedUrls = new Set<string>();

    if (user) {
        const { data: favorites } = await supabase
            .from("favorites")
            .select("consumption_url")
            .eq("user_id", user.id);

        if (favorites) {
            // @ts-ignore
            favoritedUrls = new Set((favorites as any[]).map(f => f.consumption_url));
        }
    }

    const getTypeIcon = (type: string, className = "h-4 w-4") => {
        switch (type?.toLowerCase()) {
            case "podcast":
            case "apple_podcasts":
            case "spotify": return <Headphones className={className} />;
            case "video":
            case "youtube": return <MonitorPlay className={className} />;
            case "book": return <Book className={className} />;
            case "website": return <Globe className={className} />;
            case "pdf": return <FileText className={className} />;
            default: return <Book className={className} />;
        }
    };

    const getLinkIcon = (type: string, className = "h-4 w-4") => {
        switch (type?.toLowerCase()) {
            case "youtube": return <MonitorPlay className={className} />;
            case "spotify":
            case "apple_podcasts": return <Headphones className={className} />;
            case "pdf": return <FileText className={className} />;
            case "webscan":
            case "website": return <Globe className={className} />;
            default: return <ExternalLink className={className} />;
        }
    };

    const resourceLinks: ResourceLink[] = resource.resource_links || [];

    return (
        <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-10 pt-6 px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/portal/library">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Back to Library</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="xl:col-span-8 space-y-6">
                    <Card className="overflow-hidden border-2 shadow-sm">
                        <div className="relative h-64 w-full bg-slate-900 flex items-center justify-center">
                            {resource.cover_image_url ? (
                                <div className="relative h-full w-full p-4">
                                    <img
                                        src={resource.cover_image_url}
                                        alt={resource.title}
                                        className="h-full w-full object-contain drop-shadow-xl"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    {getTypeIcon(resource.type, "h-16 w-16 mb-4")}
                                    <span className="text-lg font-medium capitalize">{resource.type}</span>
                                </div>
                            )}
                            <Badge className="absolute top-4 right-4 text-sm py-1 px-3 bg-background/90 text-foreground backdrop-blur-md shadow-lg">
                                {getTypeIcon(resource.type, "h-4 w-4 mr-2")}
                                <span className="capitalize">{resource.type}</span>
                            </Badge>
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-bold mb-2">{resource.title}</CardTitle>
                                    <p className="text-xl text-primary font-medium">{resource.author}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline" className="text-sm px-3 py-1 border-primary/20 bg-primary/5">
                                        {resource.difficulty}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        <Star className="h-5 w-5 fill-current" />
                                        <span>{resource.avg_rating}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-lg leading-relaxed whitespace-pre-line text-foreground/90">{resource.description}</p>
                            </div>

                            {resource.tags && resource.tags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Topics</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm pointer-events-none">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Links */}
                <div className="xl:col-span-4 space-y-6">
                    <Card className="shadow-sm border-2">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ExternalLink className="h-5 w-5 text-primary" />
                                Start Learning
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid gap-3">
                                {resource.main_url && (
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            size="lg"
                                            className="h-auto py-4 justify-start gap-4 flex-1 shadow-md hover:shadow-lg transition-all text-left min-w-0"
                                            asChild
                                        >
                                            <Button
                                                size="lg"
                                                className="h-auto py-4 justify-start gap-4 flex-1 shadow-md hover:shadow-lg transition-all text-left min-w-0"
                                                asChild
                                            >
                                                {(() => {
                                                    const videoId = extractVideoId(resource.main_url || "");
                                                    if (videoId) {
                                                        return (
                                                            <Link href={`/portal/watch/${videoId}`}>
                                                                <div className="p-2 bg-primary-foreground/10 rounded-full shrink-0">
                                                                    <MonitorPlay className="h-6 w-6" />
                                                                </div>
                                                                <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                                                                    <span className="font-bold text-lg truncate w-full text-left">Watch Video</span>
                                                                    <span className="text-sm opacity-90 font-normal truncate w-full">Tracking Enabled</span>
                                                                </div>
                                                                <MonitorPlay className="ml-auto h-5 w-5 opacity-70 shrink-0" />
                                                            </Link>
                                                        );
                                                    }

                                                    // Check for generic web tracking candidates (website, webscan, article)
                                                    // We generally want to track EVERYTHING if we can, but let's stick to the requested types or all?
                                                    // User asked "webscan or webpage items".
                                                    const shouldTrack = !videoId && resource.main_url;
                                                    // Actually, let's track everything that is a main content url unless it's a direct file download?
                                                    // Even file downloads can be tracked as "reading time" (PDFs).

                                                    if (shouldTrack) {
                                                        return (
                                                            <Link href={`/portal/web?url=${encodeURIComponent(resource.main_url)}&title=${encodeURIComponent(resource.title)}`}>
                                                                <div className="p-2 bg-primary-foreground/10 rounded-full shrink-0">
                                                                    <Globe className="h-6 w-6" />
                                                                </div>
                                                                <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                                                                    <span className="font-bold text-lg truncate w-full text-left">Open & Track</span>
                                                                    <span className="text-sm opacity-90 font-normal truncate w-full">Session Timer</span>
                                                                </div>
                                                                <Timer className="ml-auto h-5 w-5 opacity-70 shrink-0" />
                                                            </Link>
                                                        );
                                                    }

                                                    return (
                                                        <a href={resource.main_url} target="_blank" rel="noopener noreferrer">
                                                            <div className="p-2 bg-primary-foreground/10 rounded-full shrink-0">
                                                                <ExternalLink className="h-6 w-6" />
                                                            </div>
                                                            <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                                                                <span className="font-bold text-lg truncate w-full text-left">Open Creator Page</span>
                                                                <span className="text-sm opacity-90 font-normal truncate w-full">Main Link</span>
                                                            </div>
                                                            <ExternalLink className="ml-auto h-5 w-5 opacity-70 shrink-0" />
                                                        </a>
                                                    );
                                                })()}
                                            </Button>
                                        </Button>
                                        <FavoriteButton
                                            // @ts-ignore
                                            resource={{
                                                id: resource.id,
                                                title: resource.title,
                                                type: resource.type,
                                                author: resource.author,
                                                cover_image_url: resource.cover_image_url,
                                                main_url: resource.main_url
                                            }}
                                            initialIsFavorited={favoritedUrls.has(resource.main_url)}
                                            className="h-auto w-14 shrink-0 px-0 border-2 shadow-sm rounded-lg"
                                        />
                                    </div>
                                )}

                                {resourceLinks
                                    .filter(link => link.isActive !== false) // Only show active links in portal
                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                    .map((link, idx) => (
                                        <div key={idx} className="flex gap-2 w-full">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="h-auto py-3 justify-start gap-4 flex-1 hover:bg-secondary/50 transition-all min-w-0"
                                                asChild
                                            >
                                                {(() => {
                                                    const videoId = extractVideoId(link.url);
                                                    if (videoId) {
                                                        return (
                                                            <Link href={`/portal/watch/${videoId}`}>
                                                                <div className="p-2 bg-secondary rounded-full shrink-0">
                                                                    {getLinkIcon(link.type, "h-5 w-5")}
                                                                </div>
                                                                <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                                                                    <span className="font-semibold truncate w-full text-left">{link.label || "Alternative Link"}</span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-xs text-muted-foreground capitalize truncate">{link.type.replace('_', ' ')}</span>
                                                                        <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-1.5 py-0.5 rounded-sm font-medium">Tracking</span>
                                                                    </div>
                                                                </div>
                                                                <MonitorPlay className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                                                            </Link>
                                                        );
                                                    }

                                                    // Tracking for other types
                                                    // If it is a web type or simply exists
                                                    const isWeb = ['website', 'webscan', 'article', 'web'].includes(link.type.toLowerCase()) || link.url.startsWith('http');

                                                    if (isWeb) {
                                                        return (
                                                            <Link href={`/portal/web?url=${encodeURIComponent(link.url)}&title=${encodeURIComponent(resource.title + (link.label ? ` (${link.label})` : ""))}`}>
                                                                <div className="p-2 bg-secondary rounded-full shrink-0">
                                                                    {getLinkIcon(link.type, "h-5 w-5")}
                                                                </div>
                                                                <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                                                                    <span className="font-semibold truncate w-full text-left">{link.label || "Alternative Link"}</span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-xs text-muted-foreground capitalize truncate">{link.type.replace('_', ' ')}</span>
                                                                        <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-1.5 py-0.5 rounded-sm font-medium">Tracking</span>
                                                                    </div>
                                                                </div>
                                                                <Timer className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                                                            </Link>
                                                        );
                                                    }

                                                    return (
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                            <div className="p-2 bg-secondary rounded-full shrink-0">
                                                                {getLinkIcon(link.type, "h-5 w-5")}
                                                            </div>
                                                            <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                                                                <span className="font-semibold truncate w-full text-left">{link.label || "Alternative Link"}</span>
                                                                <span className="text-xs text-muted-foreground capitalize truncate w-full">{link.type.replace('_', ' ')}</span>
                                                            </div>
                                                            <ExternalLink className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                                                        </a>
                                                    );
                                                })()}
                                            </Button>
                                            <FavoriteButton
                                                // @ts-ignore
                                                resource={{
                                                    id: resource.id,
                                                    title: `${resource.title} (${link.label || link.type})`,
                                                    type: link.type,
                                                    author: resource.author,
                                                    cover_image_url: resource.cover_image_url,
                                                    main_url: link.url
                                                }}
                                                initialIsFavorited={favoritedUrls.has(link.url)}
                                                className="h-auto w-14 shrink-0 px-0 border shadow-sm rounded-lg"
                                            />
                                        </div>
                                    ))}

                                {!resource.main_url && resourceLinks.filter(l => l.isActive !== false).length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed">
                                        <p>No accessible links available currently.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <dt className="text-muted-foreground">Language</dt>
                                    <dd className="font-medium uppercase">{resource.language}</dd>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <dt className="text-muted-foreground">Level</dt>
                                    <dd>
                                        <Badge variant="outline">{resource.difficulty}</Badge>
                                    </dd>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <dt className="text-muted-foreground">Format</dt>
                                    <dd className="capitalize">{resource.type}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
