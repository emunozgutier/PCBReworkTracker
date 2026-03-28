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
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            {/* Modal Card */}
            <div 
                style={{
                    backgroundColor: 'var(--bg-panel)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    width: '100%',
                    maxWidth: '550px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border-color)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                    <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.2rem', fontWeight: 600 }}>{title} Evidence</h3>
                    <button onClick={onClose} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body Centerpiece */}
                <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative' }}>
                    
                    {images.length > 1 && (
                        <button 
                            onClick={handlePrev} 
                            style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text)', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Previous Image"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                        {qrUrls[images[currentIndex]] ? (
                            <img src={qrUrls[images[currentIndex]]} alt="Evidence QR" style={{ width: '240px', height: '240px', display: 'block' }} />
                        ) : (
                            <div style={{ width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Generating QR...</div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', maxWidth: '350px' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '3px' }}>
                            REWORK
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '12px', wordBreak: 'break-all', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            {images[currentIndex]}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <button 
                            onClick={handleNext} 
                            style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text)', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Next Image"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>

                {/* Thumbnails Footer */}
                {images.length > 1 && (
                    <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center', gap: '16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                style={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    transform: currentIndex === idx ? 'scale(1.1)' : 'scale(1)',
                                    filter: currentIndex === idx ? 'none' : 'grayscale(100%) opacity(40%)'
                                }}
                            >
                                {qrUrls[img] ? (
                                    <img 
                                        src={qrUrls[img]}
                                        style={{ 
                                            width: '54px', 
                                            height: '54px', 
                                            objectFit: 'contain', 
                                            borderRadius: '8px', 
                                            background: '#fff',
                                            padding: '4px',
                                            border: currentIndex === idx ? '2px solid var(--accent)' : '2px solid transparent',
                                            boxShadow: currentIndex === idx ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: '54px', height: '54px', background: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
