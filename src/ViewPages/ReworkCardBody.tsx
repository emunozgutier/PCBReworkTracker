import { useState } from 'react';
import { PictureCard } from '../components/PictureCard';
import { useStore } from '../store/useStore';
import { EditButton, ViewButton } from '../forms/ActionButtons';

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
                <EditButton 
                    onClick={(e) => { e.stopPropagation(); editItem('reworks_edit', rework.id); }}
                    label="Edit Rework"
                />
                {imagePaths.length > 0 && (
                    <ViewButton 
                        onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                        label={`View ${imagePaths.length} Photo${imagePaths.length > 1 ? 's' : ''}`}
                        icon={
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        }
                    />
                )}
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '110px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Logged At</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
                                {new Date(rework.timestamp).toLocaleDateString()}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {new Date(rework.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch', opacity: 0.6 }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Rework Type</span>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                padding: '4px 12px', 
                                background: rework.rework_type === 'Major' ? 'rgba(239, 68, 68, 0.1)' 
                                          : rework.rework_type === 'Silicon Swap' ? 'rgba(168, 85, 247, 0.1)' 
                                          : rework.rework_type === 'Resistor Option Swap' ? 'rgba(249, 115, 22, 0.1)'
                                          : 'rgba(59, 130, 246, 0.1)', 
                                color: rework.rework_type === 'Major' ? '#ef4444' 
                                     : rework.rework_type === 'Silicon Swap' ? '#a855f7' 
                                     : rework.rework_type === 'Resistor Option Swap' ? '#f97316'
                                     : '#3b82f6', 
                                borderRadius: '16px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                border: `1px solid ${
                                    rework.rework_type === 'Major' ? 'rgba(239, 68, 68, 0.2)' 
                                  : rework.rework_type === 'Silicon Swap' ? 'rgba(168, 85, 247, 0.2)' 
                                  : rework.rework_type === 'Resistor Option Swap' ? 'rgba(249, 115, 22, 0.2)'
                                  : 'rgba(59, 130, 246, 0.2)'
                                }`
                            }}>
                                {rework.rework_type || 'Minor'}
                            </div>
                        </div>

                        {(!rework.description || !rework.description.trim()) && (
                            <>
                                <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch', opacity: 0.6 }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Description</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>
                                </div>
                            </>
                        )}
                    </div>

                    {rework.description && rework.description.trim() ? (
                        <>
                            <div style={{ width: '100%', height: '1px', background: 'var(--border)', opacity: 0.6 }}></div>

                            <div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Description</span>
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {rework.description}
                                </p>
                            </div>
                        </>
                    ) : null}

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
