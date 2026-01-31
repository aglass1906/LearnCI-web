"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, MonitorPlay, Headphones, Globe, Book, FileText, ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import { ExternalImage } from "@/components/ExternalImage";
import { FavoriteButton } from "@/components/FavoriteButton";
import { extractChannelId, extractPlaylistId, extractVideoId } from "@/utils/youtube";

interface Favorite {
    id: string; // The database ID (UUID)
    title: string;
    type: string;
    consumption_url: string;
    author: string | null;
    image_url: string | null;
    created_at: string;
}

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from("favorites")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                // @ts-ignore
                setFavorites(data || []);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "podcast":
            case "apple_podcasts":
            case "spotify": return <Headphones className="h-4 w-4" />;
            case "video":
            case "youtube": return <MonitorPlay className="h-4 w-4" />;
            case "book": return <Book className="h-4 w-4" />;
            case "website": return <Globe className="h-4 w-4" />;
            case "pdf": return <FileText className="h-4 w-4" />;
            default: return <Book className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">My Favorites</h1>
                <p className="text-muted-foreground">Your collection of saved resources.</p>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-slate-50 dark:bg-slate-900 border-dashed">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No favorites yet</h3>
                    <p className="text-muted-foreground mb-6">Start exploring the library to add resources.</p>
                    <Button asChild>
                        <Link href="/portal/library">Browse Library</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                        <Card key={fav.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all group relative">
                            {(() => {
                                const isYoutubeType = fav.type.toLowerCase() === 'youtube';
                                const isChannelType = fav.type.toLowerCase() === 'channel';

                                const channelId = (isYoutubeType || isChannelType) ? extractChannelId(fav.consumption_url) : null;
                                const playlistId = (isYoutubeType || isChannelType) ? extractPlaylistId(fav.consumption_url) : null;
                                const videoId = isYoutubeType ? extractVideoId(fav.consumption_url) : null;

                                // Prioritize routing: Video -> Playlist -> Channel -> External
                                const targetId = videoId || playlistId || channelId;
                                const isInternal = !!targetId;

                                const internalHref = videoId ? `/portal/watch/${videoId}` :
                                    (playlistId || channelId) ? `/portal/channels/${targetId}` :
                                        '#'; // Should not happen if isInternal is true

                                return (
                                    <>
                                        {/* Card Image Area */}
                                        <div className="relative">
                                            <div className="absolute top-2 right-2 z-20">
                                                <FavoriteButton
                                                    resource={{
                                                        id: fav.id,
                                                        title: fav.title,
                                                        type: fav.type,
                                                        author: fav.author || "",
                                                        cover_image_url: fav.image_url || "",
                                                        main_url: fav.consumption_url
                                                    }}
                                                    initialIsFavorited={true}
                                                    className="bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background rounded-full h-8 w-8"
                                                    onToggle={(isFav) => {
                                                        if (!isFav) {
                                                            setFavorites(prev => prev.filter(f => f.id !== fav.id));
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {(() => {
                                                const content = (
                                                    <>
                                                        {fav.image_url ? (
                                                            <div className="relative h-full w-full p-2">
                                                                <ExternalImage
                                                                    src={fav.image_url}
                                                                    alt={fav.title}
                                                                    fill
                                                                    style={{ objectFit: "contain" }}
                                                                    className="transition-transform group-hover:scale-105"
                                                                    customFallback={
                                                                        <div className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-800">
                                                                            {getTypeIcon(fav.type)}
                                                                        </div>
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-800">
                                                                {getTypeIcon(fav.type)}
                                                            </div>
                                                        )}
                                                        <Badge className="absolute top-2 left-2 bg-background/90 text-foreground backdrop-blur-sm shadow-sm hover:bg-background/90 z-10 pointer-events-none">
                                                            {getTypeIcon(fav.type)}
                                                            <span className="ml-1 capitalize">{fav.type}</span>
                                                        </Badge>
                                                    </>
                                                );

                                                if (isInternal) {
                                                    return (
                                                        <Link
                                                            href={internalHref}
                                                            className="block relative h-48 w-full bg-slate-900 flex items-center justify-center cursor-pointer"
                                                        >
                                                            {content}
                                                        </Link>
                                                    );
                                                }

                                                return (
                                                    <a
                                                        href={fav.consumption_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block relative h-48 w-full bg-slate-900 flex items-center justify-center cursor-pointer"
                                                    >
                                                        {content}
                                                    </a>
                                                );
                                            })()}
                                        </div>

                                        {/* Card Content */}
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
                                                {isInternal ? (
                                                    <Link href={internalHref}>
                                                        {fav.title}
                                                    </Link>
                                                ) : (
                                                    <a href={fav.consumption_url} target="_blank" rel="noopener noreferrer">
                                                        {fav.title}
                                                    </a>
                                                )}
                                            </CardTitle>
                                            {fav.author && (
                                                <CardDescription className="font-medium text-primary">
                                                    {fav.author}
                                                </CardDescription>
                                            )}
                                        </CardHeader>

                                        {/* Card Footer */}
                                        <CardFooter className="pt-2 mt-auto border-t bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2 p-4">
                                            {isInternal ? (
                                                <>
                                                    <Button size="sm" variant="default" className="w-full gap-2" asChild>
                                                        <Link href={internalHref}>
                                                            <MonitorPlay className="h-4 w-4" /> View {videoId ? "Video" : "Videos"}
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground" asChild>
                                                        <a href={fav.consumption_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4" />
                                                            {playlistId ? "Open Playlist" : (videoId ? "Open Video" : "Open Channel")}
                                                        </a>
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="ghost" className="w-full gap-2" asChild>
                                                    <a href={fav.consumption_url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" /> Open Resource
                                                    </a>
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </>
                                );
                            })()}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
