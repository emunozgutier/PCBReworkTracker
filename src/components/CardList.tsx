import { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { ProjectCard } from '../cards/ProjectCard';
import { PcbCard } from '../cards/PcbCard';
import { ReworkCard } from '../cards/ReworkCard';

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
    const { reworks, loading: reworksLoading, fetchReworks, selectedBoards, setSelectedBoards } = useReworkStore();
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

    const { 
        selectedProjects, setSelectedProjects, 
        selectedRevisions, setSelectedRevisions, 
        selectedFlavors, setSelectedFlavors 
    } = usePcbStore();
    
    const [showFilters, setShowFilters] = useState<boolean>(
        selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0
    );

    useEffect(() => {
        if (selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0) {
            setShowFilters(true);
        }
    }, [selectedProjects, selectedRevisions, selectedFlavors]);

    switch (type) {
        case 'projects': items = projects; loading = projectsLoading; break;
        case 'pcbs': 
            items = pcbs; 
            loading = pcbsLoading || projectsLoading;
            if (selectedProjects.length > 0) {
                const projNames = selectedProjects.map(id => projects.find(p => p.id.toString() === id)?.name);
                items = items.filter(pcb => projNames.includes(pcb.project));
            }
            if (selectedRevisions.length > 0) {
                items = items.filter(pcb => selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev)));
            }
            if (selectedFlavors.length > 0) {
                items = items.filter(pcb => selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff)));
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

    const activeFilterCount = selectedProjects.length + selectedRevisions.length + selectedFlavors.length;

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
                <div className="pcb-filters" style={{  
                    marginBottom: '24px', 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'flex-start', 
                    overflowX: 'auto', 
                    width: '100%',
                    paddingBottom: '8px'
                }}>
                    
                    {/* Projects DigiKey-style Select */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Projects</span>
                        <select 
                            multiple 
                            value={selectedProjects}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setSelectedProjects(selected);
                            }}
                            style={{ 
                                width: '220px', 
                                height: '140px', 
                                padding: '6px', 
                                borderRadius: '4px', 
                                backgroundColor: 'var(--bg-panel)', 
                                border: '1px solid var(--border-color)', 
                                color: 'var(--text)', 
                                outline: 'none',
                                fontFamily: 'inherit',
                                fontSize: '0.9rem'
                            }}
                        >
                            {projects.map(p => {
                                // Count how many pcbs belong to this project AND match the selected revisions and flavors
                                const count = pcbs.filter(pcb => 
                                    pcb.project === p.name && 
                                    (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                                    (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff)))
                                ).length;
                                
                                // Only hide projects if we are actively filtering by a revision/flavor that this project doesn't have boards for
                                if ((selectedRevisions.length > 0 || selectedFlavors.length > 0) && count === 0) return null;
                                
                                return <option key={p.id} value={p.id.toString()}>{p.name} ({count})</option>;
                            })}
                        </select>
                    </div>

                    {/* Silicon Revisions Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Silicon Revisions</span>
                        <select 
                            multiple 
                            value={selectedRevisions}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setSelectedRevisions(selected);
                            }}
                            style={{ 
                                width: '220px', 
                                height: '140px', 
                                padding: '6px', 
                                borderRadius: '4px', 
                                backgroundColor: 'var(--bg-panel)', 
                                border: '1px solid var(--border-color)', 
                                color: 'var(--text)', 
                                outline: 'none',
                                fontFamily: 'inherit',
                                fontSize: '0.9rem'
                            }}
                        >
                            {(() => {
                                const activeProjects = selectedProjects.length > 0 
                                    ? projects.filter(p => selectedProjects.includes(p.id.toString()))
                                    : projects;
                                
                                const allRevs = new Set<string>();
                                activeProjects.forEach((p: any) => {
                                    if (p.revisions) p.revisions.forEach((r: string) => allRevs.add(r));
                                });

                                return Array.from(allRevs).sort().map(rev => {
                                    const count = pcbs.filter(pcb => 
                                        (pcb.product && pcb.product.includes(rev)) &&
                                        (selectedProjects.length === 0 || selectedProjects.includes(projects.find(p => p.name === pcb.project)?.id.toString() || '')) &&
                                        (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff)))
                                    ).length;
                                    if (count === 0 && selectedProjects.length > 0) return null;
                                    return <option key={rev} value={rev}>{rev} ({count})</option>;
                                });
                            })()}
                        </select>
                    </div>

                    {/* PCB Flavors Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>PCB Flavors</span>
                        <select 
                            multiple 
                            value={selectedFlavors}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setSelectedFlavors(selected);
                            }}
                            style={{ 
                                width: '220px', 
                                height: '140px', 
                                padding: '6px', 
                                borderRadius: '4px', 
                                backgroundColor: 'var(--bg-panel)', 
                                border: '1px solid var(--border-color)', 
                                color: 'var(--text)', 
                                outline: 'none',
                                fontFamily: 'inherit',
                                fontSize: '0.9rem'
                            }}
                        >
                            {(() => {
                                const activeProjects = selectedProjects.length > 0 
                                    ? projects.filter(p => selectedProjects.includes(p.id.toString()))
                                    : projects;
                                
                                const allFlavors = new Set<string>();
                                activeProjects.forEach((p: any) => {
                                    if (p.formfactors) p.formfactors.forEach((ff: any) => allFlavors.add(ff.name));
                                });

                                return Array.from(allFlavors).sort().map(ff => {
                                    const count = pcbs.filter(pcb => 
                                        (pcb.product && pcb.product.includes(ff)) &&
                                        (selectedProjects.length === 0 || selectedProjects.includes(projects.find(p => p.name === pcb.project)?.id.toString() || '')) &&
                                        (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev)))
                                    ).length;
                                    if (count === 0 && selectedProjects.length > 0) return null;
                                    return <option key={ff} value={ff}>{ff} ({count})</option>;
                                });
                            })()}
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    {(selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0) && (
                        <div style={{ alignSelf: 'flex-start', marginTop: '26px' }}>
                            <button 
                                onClick={() => { setSelectedProjects([]); setSelectedRevisions([]); setSelectedFlavors([]); }}
                                style={{ 
                                    padding: '6px 12px', 
                                    backgroundColor: 'transparent', 
                                    border: '1px solid var(--border-color)', 
                                    borderRadius: '4px', 
                                    color: 'var(--text-muted)', 
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className={`cards-grid ${['projects', 'pcbs', 'reworks'].includes(type) ? 'single-column' : ''}`}>
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

                        if (type === 'reworks') {
                            return <ReworkCard key={item.id} rework={item} onEdit={onEdit} />;
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
