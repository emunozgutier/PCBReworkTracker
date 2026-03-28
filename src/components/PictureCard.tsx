import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import QRCode from 'qrcode';

interface PictureCardProps {
    images: string[];
    title: string;
    onClose: () => void;
}

export function PictureCard({ images, title, onClose }: PictureCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    // Generate QRs
    useEffect(() => {
        const generateAll = async () => {
            const newUrls: Record<string, string> = {};
            for (const img of images) {
                try {
                    newUrls[img] = await QRCode.toDataURL(img, { 
                        margin: 2, 
                        width: 300, 
                        color: { dark: '#000000', light: '#ffffff' } 
                    });
                } catch (e) { }
            }
            setQrUrls(newUrls);
        };
        generateAll();
    }, [images]);

    if (!images || images.length === 0) return null;

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 24px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)'
                }}
            >
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 600 }}>{title} Evidence</h3>
                <button 
                    onClick={onClose}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <X size={24} />
                </button>
            </div>

            <div 
                style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    position: 'relative',
                    padding: '0 24px'
                }}
                onClick={(e) => e.stopPropagation()} // Prevent close on clicking image area
            >
                {images.length > 1 && (
                    <button 
                        onClick={handlePrev}
                        style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', padding: '12px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                    >
                        <ChevronLeft size={32} />
                    </button>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                        {qrUrls[images[currentIndex]] ? (
                            <img 
                                src={qrUrls[images[currentIndex]]} 
                                alt={`Photo ${currentIndex + 1}`} 
                                style={{ 
                                    maxHeight: '50vh', 
                                    maxWidth: '100%', 
                                    objectFit: 'contain', 
                                    borderRadius: '8px'
                                }} 
                            />
                        ) : (
                            <div style={{ width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                Generating QR...
                            </div>
                        )}
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '4px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            REWORK
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', marginTop: '8px' }}>
                            {images[currentIndex]}
                        </div>
                    </div>
                </div>

                {images.length > 1 && (
                    <button 
                        onClick={handleNext}
                        style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', padding: '12px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                    >
                        <ChevronRight size={32} />
                    </button>
                )}
            </div>

            {images.length > 1 && (
               <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '16px', background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: currentIndex === idx ? 'scale(1.1)' : 'scale(1)',
                                filter: currentIndex === idx ? 'none' : 'grayscale(100%) opacity(50%)'
                            }}
                        >
                            {qrUrls[img] ? (
                                <img 
                                    src={qrUrls[img]}
                                    style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        objectFit: 'contain', 
                                        borderRadius: '8px', 
                                        background: '#fff',
                                        padding: '4px',
                                        border: currentIndex === idx ? '2px solid var(--accent)' : '2px solid transparent'
                                    }}
                                />
                            ) : (
                                <div style={{ width: '60px', height: '60px', background: '#ccc', borderRadius: '8px' }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
