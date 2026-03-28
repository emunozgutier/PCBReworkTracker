import { useEffect, useState } from 'react';
import { useReworkStore } from '../store/storeRework';
import { useTagStore } from '../store/storeTag';
import { useStore } from '../store/useStore';
import { API_BASE } from '../api';
import { Plus, ExternalLink, QrCode as QrCodeIcon, Tag as TagIcon, X } from 'lucide-react';
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
    const [selectedTagId, setSelectedTagId] = useState('');

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

    const handleAssignTag = async () => {
        if (!selectedTagId) return setIsAssigningTag(false);
        try {
            await fetch(`${API_BASE}/pcbs/${pcb.id}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_id: selectedTagId })
            });
            await fetchAttachedTags();
        } catch (err) { }
        setIsAssigningTag(false);
        setSelectedTagId('');
    };

    const handleRemoveTag = async (tagId: number | string) => {
        try {
            await fetch(`${API_BASE}/pcbs/${pcb.id}/tags/${tagId}`, { method: 'DELETE' });
            await fetchAttachedTags();
        } catch (err) { }
    };

    const pcbReworks = reworks.filter((r: any) => r.pcb_id === pcb.id);

    return (
        <div className="card-expanded-content">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); addItem('reworks_add', pcb.id); }}
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
                    <Plus size={18} /> Add Rework log
                </button>
                {isAssigningTag ? (
                    <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select 
                            value={selectedTagId}
                            onChange={(e) => setSelectedTagId(e.target.value)}
                            style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px', borderRadius: '8px', outline: 'none' }}
                            autoFocus
                        >
                            <option value="">Select a tag...</option>
                            {tags.filter(t => !attachedTags.some(at => at.id === t.id)).map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                        <button onClick={handleAssignTag} style={{ padding: '10px 16px', background: 'var(--accent)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                        <button onClick={() => setIsAssigningTag(false)} style={{ padding: '10px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}><X size={18} /></button>
                    </div>
                ) : (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsAssigningTag(true); }}
                        style={{ 
                            flex: 1,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px', 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            color: '#34d399', 
                            border: '1px solid rgba(16, 185, 129, 0.5)', 
                            padding: '10px 16px', 
                            borderRadius: '8px', 
                            fontSize: '0.9rem', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <TagIcon size={18} /> Add Tag
                    </button>
                )}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedBoards([pcb.id.toString()]);
                        setActiveTab('reworks'); 
                    }}
                    style={{ 
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
                    <ExternalLink size={18} /> View Reworks
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setQrModalBoard(pcb.board_number); }}
                    style={{ 
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
                    <QrCodeIcon size={18} /> QR Code
                </button>
            </div>

            {attachedTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    {attachedTags.map(tag => (
                        <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40`, padding: '4px 10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
                            <TagIcon size={12} />
                            {tag.owner_username ? `${tag.owner_username}-${tag.name}` : tag.name}
                            <X size={14} style={{ cursor: 'pointer', marginLeft: '4px', opacity: 0.7 }} onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }} />
                        </div>
                    ))}
                </div>
            )}
            
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Recent Rework History</h4>
            {pcbReworks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pcbReworks.slice(0, 5).map((rework: any, index: number) => (
                        <div key={index} style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
                            <ReworkCardHeader 
                                rework={rework} 
                                isExpanded={false}
                                onToggle={() => {}}
                                onEdit={(id) => editItem('reworks_edit', id)}
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
        </div>
    );
}
