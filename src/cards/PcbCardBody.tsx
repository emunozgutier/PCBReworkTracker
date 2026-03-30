import { useEffect, useState } from 'react';
import { useReworkStore } from '../store/storeRework';
import { useTagStore } from '../store/storeTag';
import { useStore } from '../store/useStore';
import { API_BASE } from '../apiBridge';
import { FormTabs } from '../forms/FormTabs';
import { Tag as TagIcon, X } from 'lucide-react';
import { EditButton, ViewButton, AddButton, QrButton } from '../forms/ActionButtons';
import { ReworkCardHeader } from './ReworkCardHeader';

interface PcbCardBodyProps {
    pcb: any;
}

export function PcbCardBody({ pcb }: PcbCardBodyProps) {
    const { reworks, fetchReworks, setSelectedBoards } = useReworkStore();
    const { tags, fetchTags } = useTagStore();
    const { addItem, setActiveTab, setQrModalBoard, editItem } = useStore();

    const [attachedTags, setAttachedTags] = useState<any[]>([]);
    const [isAssigningTag, setIsAssigningTag] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const tabsList = ['Rework', 'Public Tags', 'Personal Tags'];
    const activeTabName = tabsList[activeTabIndex];
    
    const [isBlinking, setIsBlinking] = useState(false);
    const handleReworkClick = () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 2000);
    };

    const fetchAttachedTags = async () => {
        try {
            const res = await fetch(`${API_BASE}/pcbs/${pcb.id}/tags`);
            if (res.ok) {
                setAttachedTags(await res.json());
            }
        } catch (err) { }
    };

    useEffect(() => {
        if (reworks.length === 0) fetchReworks();
        if (tags.length === 0) fetchTags();
        fetchAttachedTags();
    }, [reworks.length, tags.length, fetchReworks, fetchTags, pcb.id]);

    const handleAssignTagDirect = async (tagId: string | number) => {
        try {
            await fetch(`${API_BASE}/pcbs/${pcb.id}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_id: tagId })
            });
            await fetchAttachedTags();
        } catch (err) { }
        setIsAssigningTag(false);
    };

    const pcbReworks = reworks.filter((r: any) => r.pcb_id === pcb.id);

    return (
        <div className="card-expanded-content">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <EditButton 
                    onClick={(e) => { e.stopPropagation(); editItem('pcbs_edit', pcb.id); }}
                    label="Edit PCB"
                />

                <QrButton 
                    onClick={(e) => { e.stopPropagation(); setQrModalBoard(pcb.board_number); }}
                />
                
                
            </div>

            <div style={{ marginTop: '20px' }}>
                <FormTabs
                    tabs={tabsList}
                    activeTab={activeTabIndex}
                    onTabChange={(t) => { setActiveTabIndex(t); setIsAssigningTag(false); }}
                />
            </div>

            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', border: '1px solid var(--border)', borderTop: 'none' }}>
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
                                    className={isBlinking ? 'blink-button' : ''}
                                    label="View All Reworks"
                                    style={{ flex: 'none' }}
                                />
                                <AddButton 
                                    onClick={(e) => { e.stopPropagation(); addItem('reworks_add', pcb.id); }}
                                    label="Add Rework log"
                                    style={{ flex: 'none' }}
                                />
                            </div>
                        </div>
                        {pcbReworks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {pcbReworks.slice(0, 5).map((rework: any, index: number) => (
                                    <div key={index} style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
                                        <ReworkCardHeader 
                                            rework={rework} 
                                            isExpanded={false}
                                            onToggle={() => handleReworkClick()}
                                        />
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

                {(activeTabName === 'Public Tags' || activeTabName === 'Personal Tags') && (
                    <>
                        {(() => {
                            const isPersonal = activeTabName === 'Personal Tags';
                            const filteredAttached = attachedTags.filter(t => isPersonal ? t.type === 'personal' : t.type !== 'personal');
                            const filteredAvailable = tags.filter(t => (isPersonal ? t.type === 'personal' : t.type !== 'personal') && !attachedTags.some(at => at.id === t.id));

                            return (
                                <div>
                                    {isAssigningTag ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select {isPersonal ? 'Personal' : 'Public'} Tag to Attach:</span>
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
                                                            {tag.owner_username ? `${tag.owner_username}-${tag.name}` : tag.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {filteredAvailable.length === 0 && (
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>All available {isPersonal ? 'personal' : 'public'} tags are already attached.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <AddButton 
                                            onClick={(e) => { e.stopPropagation(); setIsAssigningTag(true); }}
                                            label={`Add ${isPersonal ? 'Personal' : 'Public'} Tag`}
                                            style={{ width: '100%', marginBottom: '16px' }}
                                        />
                                    )}

                                    {filteredAttached.length > 0 ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                            {filteredAttached.map(tag => (
                                                <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40`, padding: '4px 10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <TagIcon size={12} />
                                                    {tag.owner_username ? `${tag.owner_username}-${tag.name}` : tag.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>
                                            No {isPersonal ? 'personal' : 'public'} tags attached.
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>
        </div>
    );
}
