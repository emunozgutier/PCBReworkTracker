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
        <div className="card-expanded-content" style={{ marginTop: '6px', paddingTop: '6px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Description</span>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>
                            {rework.description}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        {imagePaths.length > 0 && (
                            <div 
                                onClick={() => setShowGallery(true)}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    padding: '4px 8px', 
                                    background: 'rgba(99, 102, 241, 0.1)', 
                                    color: 'var(--accent)', 
                                    borderRadius: '6px', 
                                    cursor: 'pointer', 
                                    fontWeight: 600, 
                                    fontSize: '0.8rem',
                                    border: '1px dashed var(--accent)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                    <circle cx="12" cy="13" r="3"></circle>
                                </svg>
                                {imagePaths.length} Photo{imagePaths.length > 1 ? 's' : ''} (View)
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span title="Timestamp">🕒 {new Date(rework.timestamp).toLocaleString()}</span>
                            <span title="Database ID">#️⃣ ID: {rework.id}</span>
                        </div>
                    </div>
                </div>
            </div>
            {showGallery && imagePaths.length > 0 && (
                <PictureCard 
                    images={imagePaths} 
                    title={rework.rework_name || `${rework.board_number || rework.pcb_board_number || 'UNKNOWN'}-R-${String(rework.id).padStart(3, '0')}`} 
                    onClose={() => setShowGallery(false)} 
                />
            )}
        </div>
    );
}
