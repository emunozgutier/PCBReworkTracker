import { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { ProjectCard } from '../cards/ProjectCard';
import { PcbCard } from '../cards/PcbCard';
import { ReworkCard } from '../cards/ReworkCard';
import { TagCard } from '../cards/TagCard';
import { PcbFilter } from './PcbFilter';

import { useProjectStore } from '../store/storeProject';
import { usePcbStore } from '../store/storePcb';
import { useReworkStore } from '../store/storeRework';
import { useOwnerStore } from '../store/storeOwner';
import { useTagStore } from '../store/storeTag';
import { useStore } from '../store/useStore';

interface CardListProps {
    type: 'projects' | 'pcbs' | 'reworks' | 'tags' | 'owners';
    title: string;
    onAdd: () => void;
    onEdit: (id: string | number) => void;
}

export function CardList({ type, title, onAdd, onEdit }: CardListProps) {
    const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();
    const { pcbs, loading: pcbsLoading, fetchPcbs } = usePcbStore();
    const { reworks, loading: reworksLoading, fetchReworks, selectedBoards, setSelectedBoards } = useReworkStore();
    const { owners, loading: ownersLoading, fetchOwners } = useOwnerStore();
    const { tags, loading: tagsLoading, fetchTags } = useTagStore();
    const { expandedPcb, isolatedView } = useStore();

    useEffect(() => {
        if (type === 'projects') {
            fetchProjects();
            fetchPcbs();
        }
        if (type === 'pcbs') {
            fetchPcbs();
            fetchProjects(); // needed to know the project names and revisions
            fetchTags();
            fetchOwners();
        }
        if (type === 'reworks') fetchReworks();
        if (type === 'owners') fetchOwners();
        if (type === 'tags') fetchTags();
    }, [type, fetchProjects, fetchPcbs, fetchReworks, fetchOwners, fetchTags]);

    let items: any[] = [];
    let loading = false;

    const { 
        selectedProjects,
        selectedRevisions,
        selectedFlavors,
        selectedCorners,
        selectedPcbRevs,
        selectedTags,
        selectedOwners,
        selectedBoardNumbers,
        setSelectedBoardNumbers
    } = usePcbStore();
    
    const activeFilterCount = selectedProjects.length + selectedRevisions.length + selectedFlavors.length + selectedCorners.length + selectedPcbRevs.length + selectedTags.length + selectedOwners.length + selectedBoardNumbers.length;

    const [showFilters, setShowFilters] = useState<boolean>(activeFilterCount > 0);
    const [hasAutoFiltered, setHasAutoFiltered] = useState(false);

    useEffect(() => {
        if (type === 'pcbs' && expandedPcb && isolatedView && !hasAutoFiltered) {
            if (selectedBoardNumbers.length === 0) {
                setSelectedBoardNumbers([expandedPcb]);
            }
            setHasAutoFiltered(true);
        }
    }, [expandedPcb, isolatedView, type, hasAutoFiltered, selectedBoardNumbers, setSelectedBoardNumbers]);

    useEffect(() => {
        if (activeFilterCount > 0) {
            setShowFilters(true);
        }
    }, [activeFilterCount]);

    switch (type) {
        case 'projects': 
            items = [...projects]; 
            loading = projectsLoading; 
            break;
        case 'pcbs': 
            items = [...pcbs]; 
            loading = pcbsLoading || projectsLoading;
            if (selectedProjects.length > 0) {
                const projNames = selectedProjects.map(id => projects.find(p => p.id.toString() === id)?.name);
                items = items.filter(pcb => projNames.includes(pcb.project));
            }
            if (selectedRevisions.length > 0) {
                items = items.filter(pcb => selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev)));
            }
            if (selectedCorners.length > 0) {
                items = items.filter(pcb => {
                    const projectData = projects.find(p => p.name === pcb.project);
                    return projectData && projectData.silicon_corners && selectedCorners.some(corner => projectData.silicon_corners?.includes(corner));
                });
            }
            if (selectedFlavors.length > 0) {
                items = items.filter(pcb => selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff)));
            }
            if (selectedPcbRevs.length > 0) {
                items = items.filter(pcb => selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr)));
            }
            if (selectedTags.length > 0) {
                items = items.filter(pcb => selectedTags.some(tagId => pcb.tag_ids?.includes(parseInt(tagId))));
            }
            if (selectedOwners.length > 0) {
                items = items.filter(pcb => {
                    const ownerObj = owners.find(o => o.name === pcb.owner);
                    return ownerObj && selectedOwners.includes(ownerObj.username || '');
                });
            }
            if (selectedBoardNumbers && selectedBoardNumbers.length > 0) {
                items = items.filter(pcb => selectedBoardNumbers.includes(pcb.board_number));
            }
            break;
        case 'reworks': 
            items = reworks; 
            loading = reworksLoading; 
            if (selectedBoards && selectedBoards.length > 0) {
                items = items.filter(rw => selectedBoards.includes(rw.pcb_id.toString()));
            }
            break;
        case 'owners': items = owners; loading = ownersLoading; break;
        case 'tags': items = tags; loading = tagsLoading; break;
    }

    if (loading) return <div className="loading">Loading {title}...</div>;

    return (
        <div className="card-list-container">
            <div className="list-header" style={{ marginBottom: type === 'pcbs' ? '12px' : '24px' }}>
                <h2>{title}</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {type === 'pcbs' && (
                        <button 
                            className="secondary-button" 
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '8px 16px', 
                                borderRadius: '8px', 
                                backgroundColor: activeFilterCount > 0 ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-element)', 
                                border: `1px solid ${activeFilterCount > 0 ? 'var(--accent)' : 'var(--border-color)'}`, 
                                color: activeFilterCount > 0 ? 'var(--accent)' : 'var(--text)', 
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                            <span>{showFilters ? 'Hide Filters' : 'Filters'} {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
                        </button>
                    )}
                    <button className="add-button" onClick={onAdd}>
                        <Plus size={18} />
                        <span>Add New</span>
                    </button>
                </div>
            </div>
            
            {type === 'reworks' && selectedBoards && selectedBoards.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                        Filtered by Board ID: {selectedBoards.join(', ')}
                    </span>
                    <button 
                        onClick={() => setSelectedBoards([])}
                        style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--accent)', borderRadius: '4px', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                    >
                        Clear Filter
                    </button>
                </div>
            )}
            
            {type === 'pcbs' && showFilters && (
                <PcbFilter />
            )}

            <div className={`cards-grid ${['projects', 'pcbs', 'reworks', 'tags'].includes(type) ? 'single-column' : ''}`}>
                {items.length === 0 ? (
                    <div className="empty-state">No {type} found.</div>
                ) : (
                    items.map((item) => {
                        if (type === 'projects') {
                            return <ProjectCard key={item.id} project={item} />;
                        }
                        if (type === 'pcbs') {
                            return <PcbCard key={item.id} pcb={item} />;
                        }

                        if (type === 'reworks') {
                            return <ReworkCard key={item.id} rework={item} />;
                        }

                        if (type === 'tags') {
                            return <TagCard key={item.id} tag={item} onEdit={onEdit} />;
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
                                            <p>{item.username ? `@${item.username}` : 'No username'}</p>
                                        </div>
                                        <div className="pcb-mini-list" style={{ marginTop: '12px' }}>
                                            <span className="pcb-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                                                {item.pcb_count || 0} PCBs
                                            </span>
                                            <span className="pcb-pill" style={{ borderColor: '#f43f5e', color: '#f43f5e' }}>
                                                {item.rework_count || 0} Reworks
                                            </span>
                                            <span className="pcb-pill" style={{ borderColor: '#10b981', color: '#10b981' }}>
                                                {item.tag_count || 0} Tags
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
