import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '../api';

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
                
                <img 
                    src={`${API_BASE}${images[currentIndex]}`} 
                    alt={`Photo ${currentIndex + 1}`} 
                    style={{ 
                        maxHeight: '70vh', 
                        maxWidth: '100%', 
                        objectFit: 'contain', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }} 
                />

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
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '12px', background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                    {images.map((img, idx) => (
                        <img 
                            key={idx}
                            src={`${API_BASE}${img}`}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                border: currentIndex === idx ? '3px solid var(--accent)' : '2px solid transparent',
                                opacity: currentIndex === idx ? 1 : 0.5,
                                transition: 'all 0.2s ease'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
