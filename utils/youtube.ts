
const API_KEY = process.env.YOUTUBE_API_KEY;

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    publishedAt: string;
    duration?: string;
}

export interface YouTubeChannel {
    id: string;
    title: string;
    thumbnailUrl: string;
}

/**
 * Combined Channel Details Interface
 */
export interface YouTubeChannelDetails {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    uploadsPlaylistId: string;
}

/**
 * Resolves a Channel ID from a Handle or URL.
 * Currently supports simple handle extraction or passed-in IDs.
 * Real API resolution would require an additional call if we wanted to support 
 * arbitrary handles dynamically, but we can do a simplified version first.
 */
export async function resolveChannelId(input: string): Promise<string | null> {
    if (!input) return null;

    // If it looks like a Channel ID already (UC...)
    if (input.startsWith("UC") && input.length > 20) {
        return input;
    }

    // If it's a URL
    try {
        if (input.includes("youtube.com") || input.includes("youtu.be")) {
            const url = new URL(input);
            // Handle /channel/UC...
            if (url.pathname.startsWith("/channel/")) {
                return url.pathname.split("/channel/")[1];
            }
            // Handle /@handle (Requires API lookup, skipping for now or TODO)
        }
    } catch (e) {
        // invalid url, treat as raw id or handle
    }

    return input; // Fallback
}

/**
 * Resolves a Handle (e.g. @DreamingSpanish) to a Channel ID using the API.
 */
async function resolveHandleToId(handle: string): Promise<string | null> {
    if (!API_KEY) return null;

    // API requires handle param
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${API_KEY}`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].id;
        }
    } catch (e) {
        console.error("Error resolving handle:", e);
    }
    return null;
}

/**
 * Synchronous version for Client Components to extract ID from URL/String.
 * Simplistic: assumes if it looks like an ID, it is one. 
 * Or extracts from /channel/ URL.
 */
export function extractChannelId(input: string): string | null {
    if (!input) return null;

    // Raw ID
    if (input.startsWith("UC") && input.length > 20 && !input.includes("/")) {
        return input;
    }

    // URL
    try {
        if (input.includes("youtube.com") || input.includes("youtu.be")) {
            const url = new URL(input);
            if (url.pathname.startsWith("/channel/")) {
                return url.pathname.split("/channel/")[1];
            }
            if (url.pathname.startsWith("/@")) {
                return url.pathname.substring(1).split('/')[0]; // Return @handle
            }
        }
    } catch (e) { }

    return null;
}

/**
 * Extracts a Playlist ID (PL...) from a URL or String.
 */
export function extractPlaylistId(input: string): string | null {
    if (!input) return null;

    // Raw ID
    if (input.startsWith("PL") && input.length > 10 && !input.includes("/")) {
        return input;
    }

    // URL look for ?list=PL... or &list=PL...
    try {
        if (input.includes("youtube.com") || input.includes("youtu.be")) {
            const url = new URL(input);
            const listId = url.searchParams.get("list");
            if (listId && listId.startsWith("PL")) {
                return listId;
            }
        }
    } catch (e) { }

    return null;
}

/**
 * Step 1: Get the Channel Details AND 'uploads' playlist ID in one call.
 * Costs 1 Quota unit.
 */
export async function getChannelDetails(channelId: string): Promise<YouTubeChannelDetails | null> {
    if (!API_KEY) {
        console.error("YOUTUBE_API_KEY is missing");
        return null;
    }

    // Ensure we have a valid ID. If it's a handle, resolve it first.
    let targetId = channelId;

    // Check if it's a handle (starts with @) or looks like one (not a UC ID)
    const isHandle = targetId.startsWith("@") || (!targetId.startsWith("UC"));

    if (isHandle) {
        // Ensure it starts with @ for the API call if it wasn't there
        const handleToResolve = targetId.startsWith("@") ? targetId : `@${targetId}`;

        console.log(`[YouTube] detected handle potential: ${targetId} -> resolving as ${handleToResolve}`);

        const resolved = await resolveHandleToId(handleToResolve);

        if (resolved) {
            targetId = resolved;
        } else {
            console.warn(`[YouTube] Could not resolve handle: ${handleToResolve}`);
            return null;
        }
    }

    // Fetch snippet (for title/thumb) and contentDetails (for uploads ID)
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${targetId}&key=${API_KEY}`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            console.warn(`Channel not found: ${targetId}`);
            return null;
        }

        const item = data.items[0];
        const snippet = item.snippet;
        const uploadsId = item.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsId) return null;

        return {
            id: item.id,
            title: snippet.title,
            description: snippet.description,
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
            uploadsPlaylistId: uploadsId
        };
    } catch (error) {
        console.error("Error fetching channel details:", error);
        return null;
    }
}

/**
 * Step 2: Fetch videos from a Playlist ID.
 * Costs 1 Quota unit (vs 100 for search).
 */
export async function getPlaylistItems(playlistId: string, maxResults = 50): Promise<YouTubeVideo[]> {
    if (!API_KEY) return [];

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        const data = await res.json();

        if (!data.items) return [];

        // Note: For playlistItems, the 'snippet' contains most info.
        // The 'contentDetails' has the videoId.
        // Duration is NOT in playlistItems, usually requires a separate videos() call.
        // For efficiency, we'll skip duration for now or do a follow-up if critical.

        return data.items.map((item: any) => {
            const snippet = item.snippet;
            const contentDetails = item.contentDetails;
            const videoId = contentDetails?.videoId || snippet?.resourceId?.videoId;

            return {
                id: videoId,
                title: snippet.title,
                description: snippet.description,
                thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
                channelTitle: snippet.channelTitle,
                publishedAt: snippet.publishedAt,
                // duration: // Would need extra call
            };
        }).filter((v: YouTubeVideo) => v.id); // Filter out any missing IDs

    } catch (error) {
        console.error("Error fetching playlist items:", error);
        return [];
    }
}

/**
 * Fetches basic details for a Playlist (Title, Thumbnail, Author)
 */
export async function getPlaylistDetails(playlistId: string): Promise<YouTubeChannelDetails | null> {
    if (!API_KEY) return null;

    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`;

    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();

        if (!data.items || data.items.length === 0) return null;

        const snippet = data.items[0].snippet;
        return {
            id: playlistId,
            title: snippet.title,
            description: snippet.description,
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
            uploadsPlaylistId: playlistId // For compatibility, returning itself as the "uploads" list
        };
    } catch (error) {
        console.error("Error fetching playlist details:", error);
        return null;
    }
}

/**
 * Legacy wrapper: Just returns videos.
 * Note: It re-implements getChannelDetails logic strictly for compatibility if mostly just used for fetching.
 * But we recommend using getChannelDetails + getPlaylistItems for UI.
 */
export async function getChannelVideos(channelId: string): Promise<YouTubeVideo[]> {
    const details = await getChannelDetails(channelId);
    if (!details) return [];

    return await getPlaylistItems(details.uploadsPlaylistId);
}
