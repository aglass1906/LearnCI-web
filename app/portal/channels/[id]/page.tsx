
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalImage } from '@/components/ExternalImage';
import { getChannelDetails, getPlaylistItems, getPlaylistDetails } from '@/utils/youtube';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Params {
    id: string;
}

export default async function ChannelVideosPage({ params }: { params: Promise<Params> }) {
    // Await params correctly in Next.js 15+
    // Await params correctly in Next.js 15+
    // Await params correctly in Next.js 15+
    const resolvedParams = await params;
    const rawId = resolvedParams.id;
    // Decode in case it's %40handle
    const id = decodeURIComponent(rawId);

    console.log(`[ChannelPage] Rendering for ID: ${id} (Raw: ${rawId})`);

    const isPlaylist = id.startsWith("PL");

    let channelDetails;
    let videos: import("@/utils/youtube").YouTubeVideo[] = [];

    if (isPlaylist) {
        // Fetch Playlist Details
        channelDetails = await getPlaylistDetails(id);
        if (channelDetails) {
            videos = await getPlaylistItems(id);
        }
    } else {
        // Fetch Channel Details First (includes Uploads ID and Thumbnail)
        channelDetails = await getChannelDetails(id);
        // Fetch videos from Uploads playlist
        if (channelDetails) {
            videos = await getPlaylistItems(channelDetails.uploadsPlaylistId);
        }
    }

    const channelTitle = channelDetails?.title || (isPlaylist ? "Playlist Videos" : "Channel Videos");

    // Construct External URL
    let externalUrl = `https://www.youtube.com/`;
    if (isPlaylist) {
        externalUrl += `playlist?list=${id}`;
    } else if (id.startsWith('@')) {
        externalUrl += `${id}`;
    } else {
        externalUrl += `channel/${id}`;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/portal/favorites"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Favorites
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        {/* Channel Thumbnail */}
                        {channelDetails?.thumbnailUrl && (
                            <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-border shrink-0">
                                <ExternalImage
                                    src={channelDetails.thumbnailUrl}
                                    alt={channelTitle}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
                                {channelTitle}
                            </h1>
                            <p className="text-muted-foreground">
                                {videos.length} videos available
                            </p>
                        </div>
                    </div>

                    {/* External Link */}
                    <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in YouTube
                    </a>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <a
                        key={video.id}
                        href={`/portal/watch/${video.id}`}
                        // Internal link, no target=_blank
                        className="group relative block bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                    >
                        {/* Thumbnail */}
                        <div className="aspect-video relative overflow-hidden bg-muted">
                            <ExternalImage
                                src={video.thumbnailUrl}
                                alt={video.title}
                                fill
                                className="object-cover group-hover:opacity-90 transition-opacity"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
                                Video
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                {video.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {video.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Empty State */}
            {videos.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📺</span>
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">No videos found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        We couldn't fetch videos for this channel. It might be empty, or the channel ID might be incorrect.
                    </p>
                </div>
            )}
        </div>
    );
}
