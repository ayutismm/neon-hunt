import React, { useRef, useState, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';

interface ShareCardProps {
    name: string;
    rank: number;
}

const logo = '/logo.png';

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const ShareCard: React.FC<ShareCardProps> = ({ name, rank }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [pixels, setPixels] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

    // Generate random floating pixels - avoiding logo area in center
    useEffect(() => {
        const colors = ['#39ff14', '#00ff00', '#7fff00', '#32cd32'];
        const newPixels = Array.from({ length: 25 }, (_, i) => {
            let x, y;
            // Keep generating until we get a position outside the logo area
            do {
                x = Math.random() * 100;
                y = Math.random() * 100;
            } while (x > 25 && x < 75 && y > 25 && y < 55); // Avoid center logo region

            return {
                id: i,
                x,
                y,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 4,
            };
        });
        setPixels(newPixels);
    }, []);

    const downloadImage = async () => {
        if (!cardRef.current || isDownloading) return;
        setIsDownloading(true);

        try {
            const htmlToImage = await import('https://esm.sh/html-to-image@1.11.11');

            // Wait a bit for fonts to be fully loaded
            await document.fonts.ready;

            const dataUrl = await htmlToImage.toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: '#0f0f0f',
                cacheBust: true,
                includeQueryParams: true,
                fetchRequestInit: {
                    mode: 'cors',
                    cache: 'no-cache',
                },
                fontEmbedCSS: `
                    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                `,
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `hidden-protocol-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download image:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
            {/* 8-Bit Pixel Card */}
            <div
                ref={cardRef}
                className="relative w-[320px] h-[568px] overflow-hidden"
                style={{
                    backgroundColor: '#0f0f0f',
                    border: '8px solid #39ff14',
                    boxShadow: 'inset 0 0 0 4px #0f0f0f, inset 0 0 0 8px #1a4d1a',
                    imageRendering: 'pixelated',
                }}
            >
                {/* Floating pixel particles - slow random movement */}
                {pixels.map((pixel) => (
                    <div
                        key={pixel.id}
                        className="absolute"
                        style={{
                            left: `${pixel.x}%`,
                            top: `${pixel.y}%`,
                            width: '6px',
                            height: '6px',
                            backgroundColor: pixel.color,
                            boxShadow: `0 0 4px ${pixel.color}`,
                            opacity: 0.4,
                            animation: `floatPixel ${10 + pixel.delay * 3}s ease-in-out infinite`,
                            animationDelay: `${pixel.delay}s`,
                        }}
                    />
                ))}

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-between h-full p-6 py-8">

                    {/* Top - Pixel border header */}
                    <div className="text-center">
                        <div
                            className="inline-block px-6 py-3 animate-arcade-blink"
                            style={{
                                backgroundColor: '#39ff14',
                                color: '#0f0f0f',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '12px',
                                letterSpacing: '2px',
                            }}
                        >
                            ★ SUCCESS ★
                        </div>
                    </div>

                    {/* Center */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Logo - clean style with background to hide particles */}
                        <div
                            className="relative p-4 rounded-lg"
                            style={{
                                zIndex: 20,
                                backgroundColor: '#0f0f0f',
                            }}
                        >
                            <img
                                src={logo}
                                alt="Logo"
                                className="w-36 h-36"
                                style={{
                                    filter: 'hue-rotate(80deg) saturate(2) brightness(1.3) drop-shadow(0 0 20px #39ff14) drop-shadow(0 0 40px rgba(57, 255, 20, 0.5))',
                                    imageRendering: 'auto',
                                    animation: 'slowPulse 4s ease-in-out infinite',
                                }}
                            />
                        </div>

                        {/* Pixel text */}
                        <div className="text-center space-y-3">
                            <p
                                style={{
                                    color: '#39ff14',
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '11px',
                                    letterSpacing: '2px',
                                    lineHeight: '1.8',
                                    textShadow: '2px 2px 0 #0a3d0a',
                                }}
                            >
                                YOU CRACKED
                                <br />
                                THE CODE!
                            </p>

                            {/* Rank display */}
                            <p
                                style={{
                                    color: '#ffff00',
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '9px',
                                    letterSpacing: '1px',
                                    textShadow: '2px 2px 0 #665500',
                                }}
                            >
                                {getOrdinal(rank)} TO FIND IT!
                            </p>

                            {/* Player name - big pixel text */}
                            <div
                                className="py-4 px-2"
                                style={{
                                    color: '#ffffff',
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '22px',
                                    letterSpacing: '3px',
                                    textShadow: '4px 4px 0 #39ff14, 8px 8px 0 #0a3d0a',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {name.toUpperCase()}
                            </div>

                            {/* XP bar */}
                            <div className="w-full max-w-[240px] mx-auto">
                                <div
                                    className="h-5 border-2 relative overflow-hidden"
                                    style={{ borderColor: '#39ff14', backgroundColor: '#0a3d0a' }}
                                >
                                    <div
                                        className="absolute inset-y-0 left-0 animate-pulse"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#39ff14',
                                            boxShadow: 'inset -2px 0 0 #7fff00',
                                        }}
                                    />
                                </div>
                                <p
                                    className="mt-2 text-center"
                                    style={{
                                        color: '#39ff14',
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '11px',
                                    }}
                                >
                                    +1000 XP
                                </p>
                            </div>
                        </div>

                        {/* Pixel divider - removed to save space */}
                    </div>

                    {/* Bottom */}
                    <div className="text-center">
                        <p
                            style={{
                                color: '#39ff14',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '6px',
                                letterSpacing: '1px',
                                opacity: 0.7,
                            }}
                        >
                            HIDDEN PROTOCOL
                        </p>
                        <p
                            className="mt-1"
                            style={{
                                color: '#39ff14',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '6px',
                                opacity: 0.5,
                            }}
                        >
                            FRESHERS 2025
                        </p>
                    </div>
                </div>
            </div>

            {/* Download Button - Pixel Style */}
            <button
                onClick={downloadImage}
                disabled={isDownloading}
                className="flex items-center gap-3 px-6 py-3 transition-all duration-100"
                style={{
                    backgroundColor: isDownloading ? '#1a4d1a' : '#39ff14',
                    color: isDownloading ? '#39ff14' : '#0f0f0f',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '10px',
                    border: '4px solid #39ff14',
                    boxShadow: isDownloading ? 'none' : '4px 4px 0 #0a3d0a',
                    transform: isDownloading ? 'translate(2px, 2px)' : 'none',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                }}
            >
                {isDownloading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
                        <span>SAVING...</span>
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        <span>DOWNLOAD</span>
                    </>
                )}
            </button>

            {/* Share Text */}
            <div
                className="flex items-center gap-2"
                style={{
                    color: '#39ff14',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '8px',
                    opacity: 0.6,
                }}
            >
                <Share2 size={12} />
                <span>SHARE IT!</span>
            </div>

            {/* Keyframes for animations */}
            <style>{`
                @keyframes floatPixel {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(10px, -15px); }
                    50% { transform: translate(-8px, 12px); }
                    75% { transform: translate(12px, 8px); }
                }
                @keyframes slowPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                }
            `}</style>
        </div>
    );
};

export default ShareCard;
