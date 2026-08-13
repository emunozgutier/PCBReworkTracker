import { useState } from 'react';
import { PictureCard } from './PictureCard';
import { useAppState } from '../../../store/useAppState';
import { useReworkStore } from '../../../store/clientDataBase/useReworkStore';
import { usePcbStore } from '../../../store/clientDataBase/usePcbStore';
import { EditButton, DeleteButton } from '../../../components/forms/ActionButtons';
import { RemoveRework } from '../../RemovePage/RemoveRework';
import { useDeleteEditRequirements } from '../../../store/useDeleteEditRequirements';
import { InfoPill } from '../../../components/InfoPill';

interface ReworkCardBodyProps {
    rework: any;
}

export function ReworkCardBody({ rework }: ReworkCardBodyProps) {
    const [showGallery, setShowGallery] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    const { deleteRework } = useReworkStore();
    const { editItem, isMobile, currentUser, currentUserRole } = useAppState();
    const { checkReworkEditRequirements } = useDeleteEditRequirements();

    const isSuperUser = currentUserRole === 'Super User';
    const isOwner = currentUser && (
        rework.owner_id === currentUser.id || 
        rework.owner_username === currentUser.username || 
        rework.owner_name === currentUser.name
    );
    const canEditRework = isSuperUser || (currentUserRole === 'User' && isOwner);
    const canDeleteRework = isSuperUser || (currentUserRole === 'User' && isOwner);

    const confirmRemoveRework = async () => {
        const success = await deleteRework(rework.id);
        if (success) {
            usePcbStore.getState().fetchPcbs();
        } else {
            const currentError = useReworkStore.getState().error;
            alert(currentError || "Failed to delete rework log.");
        }
    };


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
                {canEditRework && (
                    <EditButton 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const { requirementsMet, daysOld } = checkReworkEditRequirements(rework);
                            if (!requirementsMet) {
                                alert(`This rework log is older than 2 weeks (Age: ${daysOld.toFixed(1)} days) and cannot be edited.`);
                                return;
                            }
                            editItem('reworks_edit', rework.id); 
                        }}
                        label={isMobile ? "Edit" : "Edit Rework"}
                    />
                )}
                {canDeleteRework && (
                    <DeleteButton 
                        onClick={(e) => { e.stopPropagation(); setIsRemoveOpen(true); }}
                        label={isMobile ? "Delete" : "Delete Rework"}
                    />
                )}
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, width: '100%' }}>
                    
                    {/* Top line: Date, Type, Owner, Picture Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {new Date(rework.timestamp).toLocaleDateString()}
                            </span>
                        </div>


                        <InfoPill 
                            text={`@${rework.owner_username || rework.owner_name || rework.owner || rework.created_by || 'Unknown'}`.padEnd(7, ' ')} 
                            color="var(--text)"
                            min_width={7}
                        />

                        {imagePaths.length > 0 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    background: 'rgba(99, 102, 241, 0.08)',
                                    border: '1px solid rgba(99, 102, 241, 0.25)',
                                    color: '#818cf8',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}
                                className="action-btn-hover"
                                title="Click to view photos"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {imagePaths.length} Photo{imagePaths.length !== 1 ? 's' : ''}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Description Below */}
                    <div style={{ width: '100%', minWidth: 0, marginTop: '4px' }}>
                        {rework.description && rework.description.trim() ? (
                            <p 
                                style={{ 
                                    margin: 0, 
                                    fontSize: '0.85rem', 
                                    color: 'var(--text)', 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    maxWidth: '100%',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
                                onClick={(e) => { e.stopPropagation(); setShowDescriptionModal(true); }}
                                title="Click to view full description"
                            >
                                {rework.description}
                            </p>
                        ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'left', display: 'block' }}>No Description</span>
                        )}
                    </div>
                </div>
            </div>

            {showDescriptionModal && rework.description && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px'
                }} onClick={() => setShowDescriptionModal(false)}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid var(--border)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        position: 'relative',
                        cursor: 'default'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowDescriptionModal(false)}
                            style={{
                                position: 'absolute', top: '16px', right: '16px',
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', padding: '6px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--text)', fontWeight: 600 }}>Rework Description</h3>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
                                {rework.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {showGallery && imagePaths.length > 0 && (
                <PictureCard 
                    images={imagePaths} 
                    title={`${rework.board_number || rework.pcb_board_number || 'UNKNOWN'}-R${String(rework.rework_number || rework.id).padStart(3, '0')}`} 
                    onClose={() => setShowGallery(false)} 
                />
            )}
            <RemoveRework
                isOpen={isRemoveOpen}
                onClose={() => setIsRemoveOpen(false)}
                onConfirm={confirmRemoveRework}
                rework={rework}
            />
        </div>
    );
}
