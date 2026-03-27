import { useState } from 'react';
import { PictureCard } from '../components/PictureCard';

interface ReworkCardBodyProps {
    rework: any;
}

export function ReworkCardBody({ rework }: ReworkCardBodyProps) {
    const [showGallery, setShowGallery] = useState(false);

    let imagePaths: string[] = [];
    if (rework.image_path) {
        try {
            imagePaths = JSON.parse(rework.image_path);
        } catch (e) {
            imagePaths = [rework.image_path];
        }
    }

    return (
        <div className="card-expanded-content">
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Rework Details</h4>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Description</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                            {rework.description}
                        </p>
                    </div>

                    {imagePaths.length > 0 && (
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Visual Evidence</span>
                            <div 
                                onClick={() => setShowGallery(true)}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '8px 16px', 
                                    background: 'rgba(99, 102, 241, 0.1)', 
                                    color: 'var(--accent)', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    fontWeight: 600, 
                                    fontSize: '0.9rem',
                                    border: '1px dashed var(--accent)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                    <circle cx="12" cy="13" r="3"></circle>
                                </svg>
                                {imagePaths.length} Photo{imagePaths.length > 1 ? 's' : ''} Attached (View)
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Timestamp</span>
                            <div style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text)' }}>
                                {new Date(rework.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Database ID</span>
                            <div style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text)' }}>
                                #{rework.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showGallery && imagePaths.length > 0 && (
                <PictureCard 
                    images={imagePaths} 
                    title={rework.rework_name || "Rework"} 
                    onClose={() => setShowGallery(false)} 
                />
            )}
        </div>
    );
}
