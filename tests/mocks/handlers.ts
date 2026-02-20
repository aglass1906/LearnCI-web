import { http, HttpResponse } from 'msw'

export const handlers = [
    // Mock YouTube API for channel details
    http.get('https://www.googleapis.com/youtube/v3/channels', ({ request }) => {
        const url = new URL(request.url)
        const id = url.searchParams.get('id')
        const handle = url.searchParams.get('forHandle')

        if (id === 'UC_MOCK_CHANNEL_ID' || handle === '@MockHandle') {
            return HttpResponse.json({
                items: [
                    {
                        id: 'UC_MOCK_CHANNEL_ID',
                        snippet: {
                            title: 'Mock Channel',
                            description: 'This is a mock channel',
                            thumbnails: {
                                high: { url: 'https://mock.url/thumb.jpg' }
                            }
                        },
                        contentDetails: {
                            relatedPlaylists: {
                                uploads: 'UU_MOCK_UPLOADS_ID'
                            }
                        }
                    }
                ]
            })
        }

        return new HttpResponse(null, { status: 404 })
    }),

    // Mock YouTube API for playlist items
    http.get('https://www.googleapis.com/youtube/v3/playlistItems', ({ request }) => {
        const url = new URL(request.url)
        const playlistId = url.searchParams.get('playlistId')

        if (playlistId === 'UU_MOCK_UPLOADS_ID') {
            return HttpResponse.json({
                items: [
                    {
                        id: 'MOCK_VIDEO_ID_1',
                        snippet: {
                            title: 'Mock Video 1',
                            description: 'Description 1',
                            thumbnails: { high: { url: 'https://mock.url/video1.jpg' } },
                            channelTitle: 'Mock Channel',
                            publishedAt: '2024-01-01T00:00:00Z'
                        },
                        contentDetails: { videoId: 'MOCK_VIDEO_ID_1' }
                    }
                ]
            })
        }

        return new HttpResponse(null, { status: 404 })
    }),

    // Mock Supabase Auth
    http.post('*/auth/v1/token', ({ request }) => {
        return HttpResponse.json({
            access_token: 'mock_access_token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock_refresh_token',
            user: {
                id: 'mock_user_id',
                email: 'test@example.com',
            },
        })
    }),

    // Mock Supabase Database (e.g., fetching decks)
    http.get('*/rest/v1/decks', () => {
        return HttpResponse.json([
            { id: 'deck_1', title: 'Spanish Basics', description: 'Beginner words' },
            { id: 'deck_2', title: 'Travel Phrases', description: 'Essential travel talk' },
        ])
    }),
]
