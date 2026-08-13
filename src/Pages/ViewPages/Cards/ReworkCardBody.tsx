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

            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    minWidth: 0,
                    overflow: 'hidden',
                }}
                onClick={(e) => { e.stopPropagation(); setShowDescriptionModal(true); }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                title="Click to view full details"
            >
                {/* Date pill */}
                <InfoPill text={new Date(rework.timestamp).toLocaleDateString()} color="var(--text-muted)" />

                {/* User pill */}
                <InfoPill
                    text={`@${rework.owner_username || rework.owner_name || rework.owner || rework.created_by || 'Unknown'}`}
                    color="var(--text-muted)"
                />

                {/* Description — single line, truncated, flex fills remaining space */}
                <span style={{
                    fontSize: '0.82rem',
                    color: rework.description?.trim() ? 'var(--text)' : 'var(--text-muted)',
                    fontStyle: rework.description?.trim() ? 'normal' : 'italic',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {rework.description?.trim() || 'No description'}
                </span>

                {/* Photos button */}
                {imagePaths.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: '#818cf8',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                        }}
                        className="action-btn-hover"
                        title="Click to view photos"
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>{imagePaths.length} Photo{imagePaths.length !== 1 ? 's' : ''}</span>
                    </button>
                )}
            </div>

            {showDescriptionModal && (
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

                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700, paddingRight: '32px' }}>
                            {rework.title || 'Rework Details'}
                        </h3>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <InfoPill text={new Date(rework.timestamp).toLocaleDateString()} color="var(--text-muted)" />
                            <InfoPill text={`@${rework.owner_username || rework.owner_name || rework.owner || rework.created_by || 'Unknown'}`} color="var(--text-muted)" />
                            {rework.rework_type && (
                                <InfoPill text={rework.rework_type} color="var(--accent)" />
                            )}
                        </div>

                        <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
                            {rework.description?.trim() ? (
                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
                                    {rework.description}
                                </p>
                            ) : (
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No description provided.</p>
                            )}
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
