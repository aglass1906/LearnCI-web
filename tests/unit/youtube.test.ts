import { describe, it, expect, vi } from 'vitest'
import { getChannelDetails, getPlaylistItems, extractVideoId } from '@/utils/youtube'

describe('YouTube Utils', () => {
    describe('extractVideoId', () => {
        it('should extract ID from standard URL', () => {
            expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
        })

        it('should extract ID from short URL', () => {
            expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
        })

        it('should return null for invalid URL', () => {
            expect(extractVideoId('https://google.com')).toBe(null)
        })
    })

    describe('API Integration (MSW)', () => {
        it('should fetch channel details using a handle', async () => {
            // Mocking process.env.YOUTUBE_API_KEY
            vi.stubEnv('YOUTUBE_API_KEY', 'MOCK_KEY')

            const details = await getChannelDetails('@MockHandle')
            expect(details).not.toBeNull()
            expect(details?.id).toBe('UC_MOCK_CHANNEL_ID')
            expect(details?.title).toBe('Mock Channel')
            expect(details?.uploadsPlaylistId).toBe('UU_MOCK_UPLOADS_ID')
        })

        it('should fetch playlist items', async () => {
            vi.stubEnv('YOUTUBE_API_KEY', 'MOCK_KEY')

            const videos = await getPlaylistItems('UU_MOCK_UPLOADS_ID')
            expect(videos).toHaveLength(1)
            expect(videos[0].id).toBe('MOCK_VIDEO_ID_1')
            expect(videos[0].title).toBe('Mock Video 1')
        })

    })
})
