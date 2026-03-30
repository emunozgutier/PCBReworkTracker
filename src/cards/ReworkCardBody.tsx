import { useState } from 'react';
import { PictureCard } from '../components/PictureCard';
import { useStore } from '../store/useStore';
import { Edit2 } from 'lucide-react';

interface ReworkCardBodyProps {
    rework: any;
}

export function ReworkCardBody({ rework }: ReworkCardBodyProps) {
    const [showGallery, setShowGallery] = useState(false);
    const { editItem } = useStore();

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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); editItem('reworks_edit', rework.id); }}
                    style={{ 
                        flex: 1,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px', 
                        background: 'transparent', 
                        color: 'var(--text)', 
                        border: '1px solid var(--border-color)', 
                        padding: '10px 16px', 
                        borderRadius: '8px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Edit2 size={18} /> Edit Rework
                </button>
                {imagePaths.length > 0 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                        style={{ 
                            flex: 1,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px', 
                            background: 'rgba(99, 102, 241, 0.15)', 
                            color: '#818cf8', 
                            border: '1px solid rgba(99, 102, 241, 0.5)', 
                            padding: '10px 16px', 
                            borderRadius: '8px', 
                            fontSize: '0.9rem', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        View {imagePaths.length} Photo{imagePaths.length > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Description</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                            {rework.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description provided.</span>}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
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
