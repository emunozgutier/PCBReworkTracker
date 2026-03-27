import { useEffect } from 'react';
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
        if (type === 'pcbs') fetchPcbs();
        if (type === 'reworks') fetchReworks();
        if (type === 'owners') fetchOwners();
        if (type === 'tags') fetchTags();
    }, [type, fetchProjects, fetchPcbs, fetchReworks, fetchOwners, fetchTags]);

    let items: any[] = [];
    let loading = false;

    switch (type) {
        case 'projects': items = projects; loading = projectsLoading; break;
        case 'pcbs': items = pcbs; loading = pcbsLoading; break;
        case 'reworks': items = reworks; loading = reworksLoading; break;
        case 'owners': items = owners; loading = ownersLoading; break;
        case 'tags': items = tags; loading = tagsLoading; break;
    }

    if (loading) return <div className="loading">Loading {title}...</div>;

    return (
        <div className="card-list-container">
            <div className="list-header">
                <h2>{title}</h2>
                <button className="add-button" onClick={onAdd}>
                    <Plus size={18} />
                    <span>Add New</span>
                </button>
            </div>
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
