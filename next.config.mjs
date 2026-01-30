/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.prod.website-files.com',
            },
            {
                protocol: 'https',
                hostname: 'spanishobsessed.com',
            },
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
            },
            {
                protocol: 'https',
                hostname: 'nihongoconteppei.com',
            },
            {
                protocol: 'https',
                hostname: 'guidetojapanese.org',
            },
            {
                protocol: 'https',
                hostname: 'd3jgmo86321q0o.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'yt3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'd3t3ozftmdmh3i.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'images.squarespace-cdn.com',
            },
            {
                protocol: 'https',
                hostname: 'yt3.ggpht.com',
            },
            {
                protocol: 'https',
                hostname: '**.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'www.spanishobsessed.com',
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
            }
        ],
    },
};

export default nextConfig;
