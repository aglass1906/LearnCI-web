import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ArrowLeft, Book, Headphones, MonitorPlay, Globe, FileText, ExternalLink, Star } from "lucide-react";
import Link from "next/link";

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
        .single();

    if (error || !resource) {
        if (error) console.error("Error fetching resource:", error);
        notFound();
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
            case "website": return <Globe className={className} />;
            default: return <ExternalLink className={className} />;
        }
    };

    const resourceLinks: ResourceLink[] = resource.resource_links || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/library">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Resource Details</h1>
                    <p className="text-muted-foreground text-sm">Preview and manage resource content</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-2">
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
                                <p className="text-lg leading-relaxed whitespace-pre-line">{resource.description}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Topics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {resource.tags?.map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Links */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Access Resource</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                {resource.main_url && (
                                    <Button
                                        variant="outline"
                                        className="h-auto py-4 justify-start gap-4 w-full group hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                                        asChild
                                    >
                                        <a href={resource.main_url} target="_blank" rel="noopener noreferrer">
                                            <div className="p-2 bg-primary/10 rounded-full group-hover:bg-background transition-colors text-primary">
                                                <ExternalLink className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col items-start overflow-hidden flex-1">
                                                <span className="font-medium truncate text-left">Open Creator Page</span>
                                                <span className="text-xs text-muted-foreground">Primary URL</span>
                                            </div>
                                            <ExternalLink className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100" />
                                        </a>
                                    </Button>
                                )}

                                {resourceLinks
                                    .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
                                    .map((link, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            className={`h-auto py-4 justify-start gap-4 w-full group hover:border-primary/50 hover:bg-primary/5 transition-all ${link.isActive === false ? 'opacity-50' : ''}`}
                                            asChild
                                        >
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                <div className="p-2 bg-secondary rounded-full group-hover:bg-background transition-colors">
                                                    {getLinkIcon(link.type, "h-5 w-5")}
                                                </div>
                                                <div className="flex flex-col items-start overflow-hidden flex-1">
                                                    <div className="flex items-center gap-2 w-full">
                                                        <span className="font-medium truncate text-left">{link.label || "Open Resource"}</span>
                                                        {link.isActive === false && (
                                                            <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">Inactive</Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground capitalize">{link.type.replace('_', ' ')} (Order: {link.order || 0})</span>
                                                </div>
                                                <ExternalLink className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100" />
                                            </a>
                                        </Button>
                                    ))}

                                {!resource.main_url && resourceLinks.length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed">
                                        <p>No links available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <dt className="text-muted-foreground">Status</dt>
                                    <dd>
                                        <Badge variant={resource.status === 'published' ? 'default' : 'secondary'}>
                                            {resource.status}
                                        </Badge>
                                    </dd>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <dt className="text-muted-foreground">Language</dt>
                                    <dd className="font-medium uppercase">{resource.language}</dd>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <dt className="text-muted-foreground">Created</dt>
                                    <dd className="font-medium">
                                        {new Date(resource.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <dt className="text-muted-foreground">Featured</dt>
                                    <dd className="font-medium">{resource.is_featured ? "Yes" : "No"}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
