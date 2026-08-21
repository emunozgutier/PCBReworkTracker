import { useEffect, useState } from 'react';
import { useReworkStore } from '../../../store/clientDataBase/useReworkStore';
import { useTagStore } from '../../../store/clientDataBase/useTagStore';
import { useAppState } from '../../../store/useAppState';
import { usePcbStore } from '../../../store/clientDataBase/usePcbStore';
import { API_BASE, apiFetch } from '../../../store/serverDataBase/apiBridge';
import { FormTabs } from '../../../components/forms/FormTabs';
import { RemoveTag } from '../../RemovePage/RemoveTag';
import { Tag as TagIcon, X, FileText } from 'lucide-react';
import { formatTagName } from '../../../store/clientDataBase/useTagStore';
import { EditButton, ViewButton, AddButton, QrButton, DeleteButton, DocsButton } from '../../../components/forms/ActionButtons';
import { RemovePcb } from '../../RemovePage/RemovePcb';
import { Popup } from '../../../components/Popup';
import { ReworkCardBody } from './ReworkCardBody';
import { COLORS } from '../../../store/useStyles';
import { InfoPill } from '../../../components/InfoPill';
import { useProjectStore } from '../../../store/clientDataBase/useProjectStore';
interface PcbCardBodyProps {
    pcb: any;
}

const getReworkTypeText = (type?: string) => {
    if (type === 'Resistor Option Swap' || type === 'Resistor Swap' || type === 'R swap') {
        return 'R Swap '.padEnd(7, ' ');
    }
    if (type === 'Silicon Swap') {
        return 'Si Swap'.padEnd(7, ' ');
    }
    const val = type || 'Minor';
    return val.padEnd(7, ' ');
};

const getReworkTypeTooltip = (type?: string) => {
    if (type === 'Major') {
        return 'some part is broken';
    }
    if (type === 'Silicon Swap') {
        return 'Silicon Swap';
    }
    if (type === 'Resistor Option Swap' || type === 'Resistor Swap' || type === 'R swap') {
        return 'a resistor option';
    }
    return 'it is working';
};

export function PcbCardBody({ pcb }: PcbCardBodyProps) {
    const { reworks, fetchReworks, setSelectedBoards } = useReworkStore();
    const { tags, fetchTags } = useTagStore();
    const { fetchPcbs, deletePcb } = usePcbStore();
    const { addItem, setActiveTab, setQrModalBoard, editItem, isMobile, currentUser, currentUserRole, allowGuestMinorRework } = useAppState();
    const { projects, projectDocs, fetchDocs } = useProjectStore();

    const isSuperUser = currentUserRole === 'Super User';

    const canAddRework = isSuperUser || currentUserRole === 'User' || (currentUserRole === 'Guest' && allowGuestMinorRework);

    const [attachedTags, setAttachedTags] = useState<any[]>([]);
    const [isAssigningTag, setIsAssigningTag] = useState(false);
    const [tagToRemove, setTagToRemove] = useState<any>(null);
    const [isRemovePcbOpen, setIsRemovePcbOpen] = useState(false);
    const [isDocsPopupOpen, setIsDocsPopupOpen] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const tabsList = ['Rework', 'Tags'];
    const mobileTabsList = ['Rework', 'Tags'];
    const activeTabName = tabsList[activeTabIndex];
    
    const [expandedReworkId, setExpandedReworkId] = useState<number | string | null>(null);
    const handleReworkClick = (reworkId: number | string) => {
        setExpandedReworkId(expandedReworkId === reworkId ? null : reworkId);
    };

    const fetchAttachedTags = async () => {
        try {
            const res = await apiFetch(`${API_BASE}/pcbs/${pcb.id}/tags`);
            if (res.ok) {
                setAttachedTags(await res.json());
            }
        } catch (err) { }
    };

    const project = projects.find(p => p.id === pcb.project_id);

    let schematicFilename = '';
    let boardFileFilename = '';
    if (project && pcb.board_flavor && pcb.board_rev) {
        const ff = project.flavors?.find(f => f.name === pcb.board_flavor);
        if (ff && ff.revisionDetails) {
            const revDetail = ff.revisionDetails.find(r => r.name === pcb.board_rev);
            if (revDetail) {
                schematicFilename = revDetail.schematic || revDetail.doc || '';
                boardFileFilename = revDetail.board_file || '';
            }
        }
    }

    const docs = project ? (projectDocs[project.id.toString()] || []) : [];
    const schematicDoc = docs.find(s => s.filename === schematicFilename);
    const boardFileDoc = docs.find(s => s.filename === boardFileFilename);

    useEffect(() => {
        if (project && !projectDocs[project.id.toString()]) {
            fetchDocs(project.id);
        }
    }, [project, projectDocs, fetchDocs]);

    useEffect(() => {
        if (reworks.length === 0) fetchReworks();
        if (tags.length === 0) fetchTags();
        fetchAttachedTags();
    }, [reworks.length, tags.length, fetchReworks, fetchTags, pcb.id]);

    const handleAssignTagDirect = async (tagId: string | number) => {
        try {
            await apiFetch(`${API_BASE}/pcbs/${pcb.id}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_id: tagId })
            });
            await fetchAttachedTags();
            fetchPcbs();
        } catch (err) { }
        setIsAssigningTag(false);
    };

    const handleRemoveTagDirect = async (tag: any) => {
        setTagToRemove(tag);
    };

    const confirmRemoveTag = async () => {
        if (!tagToRemove) return;
        try {
            await apiFetch(`${API_BASE}/pcbs/${pcb.id}/tags/${tagToRemove.id}`, {
                method: 'DELETE'
            });
            await fetchAttachedTags();
            fetchPcbs();
        } catch (err) { }
        setTagToRemove(null);
    };

    const confirmRemovePcb = async () => {
        const success = await deletePcb(pcb.id);
        if (success) {
            fetchPcbs();
        }
    };

    const pcbReworks = reworks
        .filter((r: any) => r.pcb_id === pcb.id)
        .sort((a: any, b: any) => {
            if (a.timestamp && b.timestamp) {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }
            return b.id - a.id;
        });




    return (
        <div className="card-expanded-content">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <EditButton 
                    onClick={(e) => { e.stopPropagation(); editItem('pcbs_edit', pcb.id); }}
                    disabled={!isSuperUser}
                    title={!isSuperUser ? "Only super users can do that" : "Edit PCB"}
                    label={isMobile ? "" : "Edit PCB"}
                />

                    {(schematicDoc || boardFileDoc) && (
                        <DocsButton 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDocsPopupOpen(true);
                            }}
                            label={isMobile ? "" : "Docs"}
                        />
                    )}

                <QrButton 
                    onClick={(e) => { e.stopPropagation(); setQrModalBoard(pcb.board_number); }}
                    label={isMobile ? "" : "QR Code"}
                />
                
                <DeleteButton 
                    onClick={(e) => { e.stopPropagation(); setIsRemovePcbOpen(true); }}
                    disabled={!isSuperUser}
                    title={!isSuperUser ? "Only super users can do that" : "Delete PCB"}
                    label={isMobile ? "" : "Delete PCB"}
                />
            </div>

            {pcb.manufacturer_id && (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '0.85rem'
                }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Manufacturer ID:</span>
                    <span style={{ color: 'var(--text)', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                        {pcb.manufacturer_id}
                    </span>
                </div>
            )}

            <div style={{ marginTop: pcb.manufacturer_id ? '4px' : '20px' }}>
                <FormTabs
                    tabs={isMobile ? mobileTabsList : tabsList}
                    activeTab={activeTabIndex}
                    onTabChange={(t) => { setActiveTabIndex(t); setIsAssigningTag(false); }}
                >
                {activeTabName === 'Rework' && (
                    <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Recent Rework History</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <ViewButton 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setSelectedBoards([pcb.id.toString()]);
                                        setActiveTab('reworks'); 
                                    }}
                                    className=""
                                    label="View Reworks"
                                    icon={null}
                                    style={{ flex: 'none' }}
                                />
                                {canAddRework && (
                                    <AddButton 
                                        onClick={(e) => { e.stopPropagation(); addItem('reworks_add', pcb.id); }}
                                        label="Add Rework"
                                        icon={null}
                                        style={{ flex: 'none' }}
                                    />
                                )}
                            </div>
                        </div>
                        {pcbReworks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {pcbReworks.slice(0, 5).map((rework) => (
                                    <div 
                                        key={rework.id} 
                                        style={{ 
                                            background: 'rgba(255,255,255,0.02)', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '8px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div 
                                            onClick={() => handleReworkClick(rework.id)}
                                            style={{ 
                                                padding: '10px 12px', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                fontWeight: expandedReworkId === rework.id ? 600 : 500
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                                                 <InfoPill 
                                                     text={getReworkTypeText(rework.rework_type)}
                                                     color={rework.rework_type === 'Major' ? COLORS.red : rework.rework_type === 'Silicon Swap' ? COLORS.purple : rework.rework_type === 'Resistor Option Swap' || rework.rework_type === 'Resistor Swap' || rework.rework_type === 'R swap' ? COLORS.orange : COLORS.indigo}
                                                     bg={rework.rework_type === 'Major' ? COLORS.redLight : rework.rework_type === 'Silicon Swap' ? COLORS.purpleMedium : rework.rework_type === 'Resistor Option Swap' || rework.rework_type === 'Resistor Swap' || rework.rework_type === 'R swap' ? COLORS.orangeMedium : COLORS.indigoLight}
                                                     border={`1px solid ${rework.rework_type === 'Major' ? COLORS.redBorder : rework.rework_type === 'Silicon Swap' ? COLORS.purpleBorder : rework.rework_type === 'Resistor Option Swap' || rework.rework_type === 'Resistor Swap' || rework.rework_type === 'R swap' ? COLORS.orangeBorder : COLORS.indigoBorder}`}
                                                     min_width={7}
                                                     title={getReworkTypeTooltip(rework.rework_type)}
                                                 />
                                                <span style={{ 
                                                    fontSize: '0.85rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {rework.title || (rework.rework_number ? `Rework #${rework.rework_number}` : `Rework ${rework.id}`)}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px', flexShrink: 0 }}>
                                                {new Date(rework.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {expandedReworkId === rework.id && (
                                            <div style={{ padding: '0 12px 12px 12px' }}>
                                                <ReworkCardBody rework={rework} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {pcbReworks.length > 5 && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'center', margin: '4px 0 0 0', cursor: 'pointer', padding: '4px' }}>
                                        + {pcbReworks.length - 5} older reworks...
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="no-data" style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>No rework history logged for this board.</p>
                        )}
                    </>
                )}

                {activeTabName === 'Tags' && (
                    <>
                        {(() => {
                            const allowedTag = (t: any) => {
                                if (t.type === 'public') return true;
                                if (currentUserRole === 'Super User') return true;
                                if (!currentUser) return false;
                                return t.owner_id === currentUser.id || t.owner_username === currentUser.username;
                            };
                            const filteredAttached = attachedTags.filter(allowedTag);
                            const filteredAvailable = tags.filter(t => allowedTag(t) && !attachedTags.some(at => at.id === t.id));

                            return (
                                <div>
                                    {isAssigningTag ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Tag to Attach:</span>
                                                <button onClick={(e) => { e.stopPropagation(); setIsAssigningTag(false); }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                                {filteredAvailable.map(tag => (
                                                    <div 
                                                        key={tag.id} 
                                                        onClick={(e) => { e.stopPropagation(); handleAssignTagDirect(tag.id); }}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                                            background: `${tag.color}20`, color: tag.color, 
                                                            border: `1px solid ${tag.color}40`, padding: '8px 12px', 
                                                            borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, 
                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <TagIcon size={14} style={{ flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {formatTagName(tag)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {filteredAvailable.length === 0 && (
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>All available tags are already attached.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <AddButton 
                                            onClick={(e) => { e.stopPropagation(); setIsAssigningTag(true); }}
                                            label="Add Tag"
                                            style={{ width: '100%', marginBottom: '16px' }}
                                        />
                                    )}

                                    {filteredAttached.length > 0 ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                            {filteredAttached.map(tag => (
                                                <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40`, padding: '4px 10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <TagIcon size={12} />
                                                    {formatTagName(tag)}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveTagDirect(tag); }}
                                                        style={{
                                                            background: 'none', border: 'none', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: tag.color, padding: 0, marginLeft: '4px', opacity: 0.7
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>
                                            No tags attached.
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </>
                )}
            </FormTabs>
            </div>

            <RemoveTag 
                isOpen={!!tagToRemove} 
                onClose={() => setTagToRemove(null)} 
                onConfirm={confirmRemoveTag} 
                tag={tagToRemove} 
                pcb={pcb} 
            />

            <RemovePcb 
                isOpen={isRemovePcbOpen}
                onClose={() => setIsRemovePcbOpen(false)}
                onConfirm={confirmRemovePcb}
                pcb={pcb}
            />

            <Popup 
                isOpen={isDocsPopupOpen} 
                onClose={() => setIsDocsPopupOpen(false)} 
                title={`${pcb.board_number} Docs`}
                maxWidth="500px"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    {schematicDoc && (
                        <div 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '12px 16px', 
                                background: 'rgba(255, 255, 255, 0.02)', 
                                border: '1px solid var(--border)', 
                                borderRadius: '8px',
                                gap: '12px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '8px', 
                                    background: 'rgba(99, 102, 241, 0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <FileText size={20} color="var(--accent)" />
                                </div>
                                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Schematic</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={schematicDoc.filename}>
                                        {schematicDoc.filename}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    editItem('doc_viewer', schematicDoc.id);
                                    setIsDocsPopupOpen(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '6px',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                }}
                            >
                                <span>View</span>
                            </button>
                        </div>
                    )}

                    {boardFileDoc && (
                        <div 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '12px 16px', 
                                background: 'rgba(255, 255, 255, 0.02)', 
                                border: '1px solid var(--border)', 
                                borderRadius: '8px',
                                gap: '12px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '8px', 
                                    background: 'rgba(99, 102, 241, 0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <FileText size={20} color="var(--accent)" />
                                </div>
                                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Board File</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={boardFileDoc.filename}>
                                        {boardFileDoc.filename}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    editItem('board_viewer', boardFileDoc.id);
                                    setIsDocsPopupOpen(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '6px',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                }}
                            >
                                <span>View</span>
                            </button>
                        </div>
                    )}
                </div>
            </Popup>
        </div>
    );
}
