import { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { ProjectCard } from '../cards/ProjectCard';
import { PcbCard } from '../cards/PcbCard';

import { useProjectStore } from '../store/storeProject';
import { usePcbStore } from '../store/storePcb';
import { useReworkStore } from '../store/storeRework';
import { useOwnerStore } from '../store/storeOwner';
import { useTagStore } from '../store/storeTag';

interface CardListProps {
    type: 'projects' | 'pcbs' | 'reworks' | 'tags' | 'owners';
    title: string;
    onAdd: () => void;
    onEdit: (id: string | number) => void;
}

export function CardList({ type, title, onAdd, onEdit }: CardListProps) {
    const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();
    const { pcbs, loading: pcbsLoading, fetchPcbs } = usePcbStore();
    const { reworks, loading: reworksLoading, fetchReworks } = useReworkStore();
    const { owners, loading: ownersLoading, fetchOwners } = useOwnerStore();
    const { tags, loading: tagsLoading, fetchTags } = useTagStore();

    useEffect(() => {
        if (type === 'projects') fetchProjects();
        if (type === 'pcbs') {
            fetchPcbs();
            fetchProjects(); // needed to know the project names and revisions
        }
        if (type === 'reworks') fetchReworks();
        if (type === 'owners') fetchOwners();
        if (type === 'tags') fetchTags();
    }, [type, fetchProjects, fetchPcbs, fetchReworks, fetchOwners, fetchTags]);

    let items: any[] = [];
    let loading = false;

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedRevisions, setSelectedRevisions] = useState<string[]>([]);

    switch (type) {
        case 'projects': items = projects; loading = projectsLoading; break;
        case 'pcbs': 
            items = pcbs; 
            loading = pcbsLoading || projectsLoading;
            if (selectedProjectId) {
                const proj = projects.find(p => p.id.toString() === selectedProjectId);
                if (proj) {
                    items = items.filter(pcb => pcb.project === proj.name);
                    if (selectedRevisions.length > 0) {
                        items = items.filter(pcb => selectedRevisions.some(rev => pcb.product.includes(rev)));
                    }
                }
            }
            break;
        case 'reworks': items = reworks; loading = reworksLoading; break;
        case 'owners': items = owners; loading = ownersLoading; break;
        case 'tags': items = tags; loading = tagsLoading; break;
    }

    if (loading) return <div className="loading">Loading {title}...</div>;

    return (
        <div className="card-list-container">
            <div className="list-header" style={{ marginBottom: type === 'pcbs' ? '12px' : '24px' }}>
                <h2>{title}</h2>
                <button className="add-button" onClick={onAdd}>
                    <Plus size={18} />
                    <span>Add New</span>
                </button>
            </div>
            
            {type === 'pcbs' && (
                <div className="pcb-filters" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select 
                        value={selectedProjectId}
                        onChange={(e) => {
                            setSelectedProjectId(e.target.value);
                            setSelectedRevisions([]);
                        }}
                        style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text)', outline: 'none' }}
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => {
                            const count = pcbs.filter(pcb => pcb.project === p.name).length;
                            if (count === 0) return null;
                            return <option key={p.id} value={p.id}>{p.name} ({count})</option>;
                        })}
                    </select>

                    {selectedProjectId && (() => {
                        const proj = projects.find(p => p.id.toString() === selectedProjectId);
                        if (!proj || !proj.revisions || proj.revisions.length === 0) return null;
                        
                        return (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Silicon Revs:</span>
                                {proj.revisions.map((rev: string) => {
                                    const count = pcbs.filter(pcb => pcb.project === proj.name && pcb.product && pcb.product.includes(rev)).length;
                                    const isSelected = selectedRevisions.includes(rev);
                                    return (
                                        <button 
                                            key={rev}
                                            onClick={() => {
                                                if (isSelected) setSelectedRevisions(selectedRevisions.filter(r => r !== rev));
                                                else setSelectedRevisions([...selectedRevisions, rev]);
                                            }}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '16px',
                                                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                                                backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-panel)',
                                                color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                gap: '6px',
                                                alignItems: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {rev} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({count})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            )}

            <div className={`cards-grid ${type === 'projects' || type === 'pcbs' ? 'single-column' : ''}`}>
                {items.length === 0 ? (
                    <div className="empty-state">No {type} found.</div>
                ) : (
                    items.map((item) => {
                        if (type === 'projects') {
                            return <ProjectCard key={item.id} project={item} onEdit={onEdit} />;
                        }
                        if (type === 'pcbs') {
                            return <PcbCard key={item.id} pcb={item} onEdit={onEdit} />;
                        }

                        return (
                            <div key={item.id} className="item-card">
                                <div className="card-actions-overlay">
                                    <button className="edit-button" onClick={(e) => { e.stopPropagation(); onEdit(item.id); }}>
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                {type === 'owners' && (
                                    <>
                                        <div className="card-title">
                                            <span className="board-num">{item.name}</span>
                                        </div>
                                        <div className="card-details">
                                            <p>Active Owner</p>
                                        </div>
                                    </>
                                )}
                                {type === 'reworks' && (
                                    <>
                                        <div className="card-title">
                                            <span className="board-num">PCB #{item.pcb_board_number}</span>
                                            <span className="status-pill">{item.status}</span>
                                        </div>
                                        <div className="card-details">
                                            <p>{item.description}</p>
                                            <p><small>{new Date(item.timestamp).toLocaleString()}</small></p>
                                        </div>
                                    </>
                                )}
                                {type === 'tags' && (
                                    <div className="card-title" style={{ marginBottom: 0 }}>
                                        <span className="board-num">{item.name}</span>
                                        <div 
                                            style={{ 
                                                width: 16, height: 16, borderRadius: '50%', 
                                                backgroundColor: item.color || '#818cf8' 
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
