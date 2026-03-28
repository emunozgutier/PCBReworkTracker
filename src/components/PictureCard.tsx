import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PatternImage = ({ id, width, height, borderRadius }: { id: string, width: string, height: string, borderRadius?: string }) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = Math.imul(31, hash) + id.charCodeAt(i) | 0;

    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 120 + (Math.abs(hash) % 60)) % 360; 
    const h3 = (h2 + 120 + (Math.abs(hash) % 30)) % 360;
    
    const [c1, c2, c3] = [
        `hsl(${h1}, 80%, 65%)`,
        `hsl(${h2}, 85%, 55%)`,
        `hsl(${h3}, 75%, 45%)`
    ];

    const pixels = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
            const bit = (Math.abs(hash) >> (row * 2 + col)) % 3;
            const color = bit === 0 ? c1 : bit === 1 ? c2 : c3;
            pixels.push(<rect key={`${row}-${col}-L`} x={col * 25} y={row * 25} width="25" height="25" fill={color} />);
            pixels.push(<rect key={`${row}-${col}-R`} x={(3 - col) * 25} y={row * 25} width="25" height="25" fill={color} />);
        }
    }

    return (
        <svg viewBox="0 0 100 100" style={{ width, height, borderRadius: borderRadius || '8px', display: 'block', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <rect width="100" height="100" fill={c1} opacity={0.15} />
            {pixels}
        </svg>
    );
};

interface PictureCardProps {
    images: string[];
    title: string;
    onClose: () => void;
}

export function PictureCard({ images, title, onClose }: PictureCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

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
                    backgroundColor: 'var(--bg)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    width: '100%',
                    maxWidth: '550px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
                    <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.2rem', fontWeight: 600 }}>{title} Evidence</h3>
                    <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body Centerpiece */}
                <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative' }}>
                    
                    {images.length > 1 && (
                        <button 
                            onClick={handlePrev} 
                            style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Previous Image"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', flexShrink: 0, border: '1px solid var(--border)' }}>
                        <PatternImage id={images[currentIndex] || ''} width="240px" height="240px" borderRadius="12px" />
                    </div>

                    <div style={{ textAlign: 'center', maxWidth: '350px' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '3px' }}>
                            REWORK
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '12px', wordBreak: 'break-all', padding: '8px 12px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                            {images[currentIndex]}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <button 
                            onClick={handleNext} 
                            style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '50%', padding: '10px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Next Image"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>

                {/* Thumbnails Footer */}
                {images.length > 1 && (
                    <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center', gap: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border)' }}>
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                style={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    transform: currentIndex === idx ? 'scale(1.1)' : 'scale(1)',
                                    filter: currentIndex === idx ? 'none' : 'grayscale(100%) opacity(40%)',
                                    borderRadius: '8px',
                                    border: currentIndex === idx ? '2px solid var(--accent)' : '2px solid transparent',
                                    boxShadow: currentIndex === idx ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                }}
                            >
                                <PatternImage id={img} width="54px" height="54px" borderRadius="6px" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
