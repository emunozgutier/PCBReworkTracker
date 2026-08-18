import { useState } from 'react';
import { useAppState } from '../../store/useAppState';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { COLORS } from '../../store/useStyles';
import { useTagStore, formatTagName } from '../../store/clientDataBase/useTagStore';
import { useOwnerStore } from '../../store/clientDataBase/useOwnerStore';
import { PcbFilterElement } from './PcbFilterElement';
import { PcbFilterGroup } from './PcbFilterGroup';
import './PcbFilter.css';

function MobileFilterGroup({ title, activeCount, isExpanded, onToggle, children }: { title: string; activeCount: number; isExpanded: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div style={{ 
            border: '1px solid var(--border)', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            background: 'var(--bg-element)' 
        }}>
            <button 
                onClick={onToggle}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{title}</span>
                    {activeCount > 0 && (
                        <span style={{ 
                            color: 'var(--accent)', 
                            fontWeight: 700,
                            marginLeft: '4px'
                        }}>
                            #{activeCount}
                        </span>
                    )}
                </div>
                <span style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </span>
            </button>
            {isExpanded && (
                <div style={{ 
                    padding: '16px', 
                    borderTop: '1px solid var(--border)', 
                    background: 'rgba(0,0,0,0.1)' 
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}

export function PcbFilter() {
    const isMobile = useAppState(state => state.isMobile);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const { 
        pcbs,
        selectedProjects, setSelectedProjects, 
        selectedRevisions, setSelectedRevisions, 
        selectedCorners, setSelectedCorners,
        selectedFlavors, setSelectedFlavors,
        selectedPcbRevs, setSelectedPcbRevs,
        selectedTags, setSelectedTags,
        requiredTags, setRequiredTags,
        selectedOwners, setSelectedOwners,
        selectedBoardNumbers, setSelectedBoardNumbers,
        selectedBoms, setSelectedBoms
    } = usePcbStore();
    
    const { projects } = useProjectStore();
    const { tags } = useTagStore();
    const { owners } = useOwnerStore();

    /** Returns true when a filter's value holds only the deselect-all sentinel ('__NONE__'). */
    const isDeselectedAll = (arr: string[]) => arr.length === 1 && arr[0] === '__NONE__';

    /** True when at least one field is in the "deselect-all" sentinel state.
     *  When this is true, every filter element should keep its items visible (even at count=0)
     *  so the user can re-select options without the list going blank. */
    const anyFieldDeselectedAll =
        isDeselectedAll(selectedProjects) ||
        isDeselectedAll(selectedRevisions) ||
        isDeselectedAll(selectedCorners) ||
        isDeselectedAll(selectedFlavors) ||
        isDeselectedAll(selectedPcbRevs) ||
        isDeselectedAll(selectedOwners) ||
        isDeselectedAll(selectedBoardNumbers) ||
        isDeselectedAll(selectedBoms);

    // Helper to evaluate a PCB against all filters except the one currently generating options.
    // The sentinel ['__NONE__'] IS treated as an active filter so other elements correctly show count=0.
    const matchPcb = (pcb: any, ignoreField: 'project' | 'revision' | 'corner' | 'flavor' | 'pcbrev' | 'tag' | 'owner' | 'boardnum' | 'bom') => {
        if (ignoreField !== 'project' && selectedProjects.length > 0) {
            const pObj = projects.find(p => p.name === pcb.project);
            if (!pObj || !selectedProjects.includes(pObj.id.toString())) return false;
        }
        if (ignoreField !== 'revision' && selectedRevisions.length > 0) {
            if (!pcb.silicon_rev || !selectedRevisions.includes(pcb.silicon_rev)) return false;
        }
        if (ignoreField !== 'corner' && selectedCorners.length > 0) {
            if (!pcb.silicon_corner || !selectedCorners.includes(pcb.silicon_corner)) return false;
        }
        if (ignoreField !== 'flavor' && selectedFlavors.length > 0) {
            if (!pcb.board_flavor || !selectedFlavors.includes(pcb.board_flavor)) return false;
        }
        if (ignoreField !== 'pcbrev' && selectedPcbRevs.length > 0) {
            if (!pcb.board_rev || !selectedPcbRevs.includes(pcb.board_rev)) return false;
        }
        if (ignoreField !== 'tag') {
            if (selectedTags.length > 0) {
                // selectedTags = excluded tag groups → hide boards that have any excluded tag
                if (pcb.tag_ids && selectedTags.some(group => group.split(',').some(tagId => pcb.tag_ids?.includes(parseInt(tagId))))) return false;
            }
            if (requiredTags.length > 0) {
                // requiredTags = required tag groups → board must have at least one tag from each required group
                if (!pcb.tag_ids || !requiredTags.every(group => group.split(',').some(tagId => pcb.tag_ids?.includes(parseInt(tagId))))) return false;
            }
        }
        if (ignoreField !== 'owner' && selectedOwners.length > 0) {
            if (!selectedOwners.includes(pcb.owner)) return false;
        }
        if (ignoreField !== 'boardnum' && selectedBoardNumbers.length > 0) {
            if (!selectedBoardNumbers.includes(pcb.board_number)) return false;
        }
        if (ignoreField !== 'bom' && selectedBoms.length > 0) {
            if (!pcb.bom || !selectedBoms.includes(pcb.bom)) return false;
        }
        return true;
    };

    const hasAnyOtherFilter = (ignoreField: string) => {
        const filters = {
            project: selectedProjects.length > 0,
            revision: selectedRevisions.length > 0,
            corner: selectedCorners.length > 0,
            flavor: selectedFlavors.length > 0,
            pcbrev: selectedPcbRevs.length > 0,
            tag: selectedTags.length > 0 || requiredTags.length > 0,
            owner: selectedOwners.length > 0,
            boardnum: selectedBoardNumbers.length > 0,
            bom: selectedBoms.length > 0
        };
        // @ts-ignore
        filters[ignoreField] = false;
        return Object.values(filters).some(Boolean);
    };

    if (isMobile) {
        return (
            <div className="pcb-filters-mobile">
                <MobileFilterGroup 
                    title="Silicon Filters" 
                    activeCount={selectedProjects.length + selectedRevisions.length + selectedCorners.length}
                    isExpanded={expandedGroup === 'silicon'}
                    onToggle={() => setExpandedGroup(expandedGroup === 'silicon' ? null : 'silicon')}
                >
                    <div className="pcb-filter-group-inner">
                        <PcbFilterElement title="Projects" value={selectedProjects} onChange={setSelectedProjects}>
                            {projects.map(p => {
                                const count = pcbs.filter(pcb => pcb.project === p.name && matchPcb(pcb, 'project')).length;
                                if (count === 0 && hasAnyOtherFilter('project')) return null;
                                return <option key={p.id} value={p.id.toString()}>{p.name} ({count})</option>;
                            })}
                        </PcbFilterElement>

                        <PcbFilterElement title="Rev" value={selectedRevisions} onChange={setSelectedRevisions}>
                            {(() => {
                                const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                                const allRevs = new Set<string>();
                                activeProjects.forEach((p: any) => { if (p.revisions) p.revisions.forEach((r: string) => allRevs.add(r)); });
                                if (pcbs.some(pcb => pcb.product && (pcb.product.includes('No part yet') || pcb.product.includes('No part')))) {
                                    allRevs.add('No part');
                                }
                                return Array.from(allRevs).sort().map(rev => {
                                    const count = pcbs.filter(pcb => (pcb.silicon_rev === rev || (rev === 'No part' && (pcb.silicon_rev === 'No part yet' || pcb.silicon_rev === 'No part'))) && matchPcb(pcb, 'revision')).length;
                                    if (count === 0 && hasAnyOtherFilter('revision')) return null;
                                    return <option key={rev} value={rev}>{rev === 'No part' || rev === 'No part yet' ? 'N/A (No part)' : rev} ({count})</option>;
                                });
                            })()}
                        </PcbFilterElement>

                        <PcbFilterElement title="Corners" value={selectedCorners} onChange={setSelectedCorners}>
                            {(() => {
                                const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                                const allCorners = new Set<string>();
                                activeProjects.forEach((p: any) => { if (p.silicon_corners) p.silicon_corners.split(',').forEach((c: string) => allCorners.add(c.trim())); });
                                return Array.from(allCorners).filter(Boolean).sort().map(corner => {
                                    const count = pcbs.filter(pcb => pcb.silicon_corner === corner && matchPcb(pcb, 'corner')).length;
                                    if (count === 0 && hasAnyOtherFilter('corner')) return null;
                                    return <option key={corner} value={corner}>{corner} ({count})</option>;
                                });
                            })()}
                        </PcbFilterElement>
                    </div>
                </MobileFilterGroup>

                <MobileFilterGroup 
                    title="PCB Filters" 
                    activeCount={selectedBoardNumbers.length + selectedFlavors.length + selectedPcbRevs.length + selectedBoms.length}
                    isExpanded={expandedGroup === 'pcb'}
                    onToggle={() => setExpandedGroup(expandedGroup === 'pcb' ? null : 'pcb')}
                >
                    <div className="pcb-filter-group-inner">
                        <PcbFilterElement title="Name" value={selectedBoardNumbers} onChange={setSelectedBoardNumbers} width="150px">
                            {pcbs
                                .filter(pcb => matchPcb(pcb, 'boardnum'))
                                .sort((a,b) => a.board_number.localeCompare(b.board_number))
                                .map(pcb => (
                                    <option key={pcb.id} value={pcb.board_number}>{pcb.board_number}</option>
                                ))
                            }
                        </PcbFilterElement>

                        <PcbFilterElement title="Flavors" value={selectedFlavors} onChange={setSelectedFlavors}>
                            {(() => {
                                const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                                const allFlavors = new Set<string>();
                                activeProjects.forEach((p: any) => { if (p.flavors) p.flavors.forEach((ff: any) => allFlavors.add(ff.name)); });
                                return Array.from(allFlavors).sort().map(ff => {
                                    const count = pcbs.filter(pcb => pcb.board_flavor === ff && matchPcb(pcb, 'flavor')).length;
                                    if (count === 0 && hasAnyOtherFilter('flavor')) return null;
                                    return <option key={ff} value={ff}>{ff} ({count})</option>;
                                });
                            })()}
                        </PcbFilterElement>

                        <PcbFilterElement title="Revs" value={selectedPcbRevs} onChange={setSelectedPcbRevs}>
                            {(() => {
                                const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                                const allPcbRevs = new Set<string>();
                                activeProjects.forEach((p: any) => { 
                                    if (p.flavors) {
                                        p.flavors.forEach((ff: any) => {
                                            if (ff.revisions) {
                                                ff.revisions.forEach((r: string) => allPcbRevs.add(r));
                                            }
                                        });
                                    }
                                });
                                return Array.from(allPcbRevs).sort().map(pr => {
                                    const count = pcbs.filter(pcb => pcb.board_rev === pr && matchPcb(pcb, 'pcbrev')).length;
                                    if (count === 0 && hasAnyOtherFilter('pcbrev')) return null;
                                    return <option key={pr} value={pr}>{pr} ({count})</option>;
                                });
                            })()}
                        </PcbFilterElement>

                        <PcbFilterElement title="BOM" value={selectedBoms} onChange={setSelectedBoms}>
                            {(() => {
                                const allBoms = new Set<string>();
                                pcbs.forEach(pcb => {
                                    if (pcb.bom) allBoms.add(pcb.bom);
                                });
                                return Array.from(allBoms).filter(Boolean).sort().map(b => {
                                    const count = pcbs.filter(pcb => pcb.bom === b && matchPcb(pcb, 'bom')).length;
                                    if (count === 0 && hasAnyOtherFilter('bom')) return null;
                                    return <option key={b} value={b}>{b} ({count})</option>;
                                });
                            })()}
                        </PcbFilterElement>
                    </div>
                </MobileFilterGroup>

                <MobileFilterGroup 
                    title="Organization" 
                    activeCount={selectedTags.length + selectedOwners.length}
                    isExpanded={expandedGroup === 'org'}
                    onToggle={() => setExpandedGroup(expandedGroup === 'org' ? null : 'org')}
                >
                    <div className="pcb-filter-group-inner">
                        <PcbFilterElement 
                            title={
                                <span className="pfe-tooltip-wrapper">
                                    Tags 
                                    <span className="pfe-tooltip-icon">?</span>
                                    <div className="pfe-tooltip-content">
                                        <div className="pfe-tooltip-row">
                                            <div className="pfe-tooltip-box pfe-tooltip-ignored"></div>
                                            <span>Does not matter</span>
                                        </div>
                                        <div className="pfe-tooltip-row">
                                            <div className="pfe-tooltip-box pfe-tooltip-required">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                            </div>
                                            <span>Must have it</span>
                                        </div>
                                        <div className="pfe-tooltip-row">
                                            <div className="pfe-tooltip-box pfe-tooltip-excluded">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                            <span>Must NOT have it</span>
                                        </div>
                                    </div>
                                </span>
                            }
                            threeStateMode
                            value={selectedTags} 
                            requiredValue={requiredTags}
                            onChange={(newExcluded) => {
                                setSelectedTags(newExcluded);
                            }}
                            onRequiredChange={(newRequired) => {
                                setRequiredTags(newRequired);
                            }}
                        >
                            {(() => {
                                const publicTags = tags.filter((t: any) => t.type === 'public');
                                const grouped = new Map<string, any[]>();
                                publicTags.forEach((t: any) => {
                                    const name = formatTagName(t);
                                    if (!grouped.has(name)) grouped.set(name, []);
                                    grouped.get(name)!.push(t);
                                });
                                return Array.from(grouped.entries()).map(([name, groupTags]) => {
                                    const groupIds = groupTags.map(t => t.id);
                                    const count = pcbs.filter(pcb => pcb.tag_ids && pcb.tag_ids.some(id => groupIds.includes(id)) && matchPcb(pcb, 'tag')).length;
                                    if (count === 0 && hasAnyOtherFilter('tag')) return null;
                                    const valueStr = groupIds.join(',');
                                    return <option key={name} value={valueStr}>{name} ({count})</option>;
                                });
                            })()}
                        </PcbFilterElement>

                        <PcbFilterElement title="Owner" value={selectedOwners} onChange={setSelectedOwners}>
                            {owners.map(owner => {
                                const count = pcbs.filter(pcb => pcb.owner === owner.name && matchPcb(pcb, 'owner')).length;
                                if (count === 0 && hasAnyOtherFilter('owner')) return null;
                                return <option key={owner.id} value={owner.name}>{owner.username} ({count})</option>;
                            })}
                        </PcbFilterElement>
                    </div>
                </MobileFilterGroup>
            </div>
        );
    }

    return (
        <div className="pcb-filters">
            
            {/* Silicon Group */}
            <PcbFilterGroup title="Silicon Filters" color={COLORS.purpleAccent}>
                <PcbFilterElement title="Projects" value={selectedProjects} onChange={setSelectedProjects}>
                    {projects.map(p => {
                        const count = pcbs.filter(pcb => pcb.project === p.name && matchPcb(pcb, 'project')).length;
                        if (count === 0 && hasAnyOtherFilter('project') && !anyFieldDeselectedAll && !selectedProjects.includes(p.id.toString())) return null;
                        return <option key={p.id} value={p.id.toString()}>{p.name} ({count})</option>;
                    })}
                </PcbFilterElement>

                <PcbFilterElement title="Rev" value={selectedRevisions} onChange={setSelectedRevisions}>
                    {(() => {
                        const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                        const allRevs = new Set<string>();
                        activeProjects.forEach((p: any) => { if (p.revisions) p.revisions.forEach((r: string) => allRevs.add(r)); });
                        
                        // Dynamically inject implicit 'No part' placeholder if any board matches
                        if (pcbs.some(pcb => pcb.product && (pcb.product.includes('No part yet') || pcb.product.includes('No part')))) {
                            allRevs.add('No part');
                        }

                        return Array.from(allRevs).sort().map(rev => {
                            const count = pcbs.filter(pcb => (pcb.silicon_rev === rev || (rev === 'No part' && (pcb.silicon_rev === 'No part yet' || pcb.silicon_rev === 'No part'))) && matchPcb(pcb, 'revision')).length;
                            if (count === 0 && hasAnyOtherFilter('revision') && !anyFieldDeselectedAll && !selectedRevisions.includes(rev)) return null;
                            return <option key={rev} value={rev}>{rev === 'No part' || rev === 'No part yet' ? 'N/A (No part)' : rev} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>

                <PcbFilterElement title="Corners" value={selectedCorners} onChange={setSelectedCorners}>
                    {(() => {
                        const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                        const allCorners = new Set<string>();
                        activeProjects.forEach((p: any) => { if (p.silicon_corners) p.silicon_corners.split(',').forEach((c: string) => allCorners.add(c.trim())); });

                        return Array.from(allCorners).filter(Boolean).sort().map(corner => {
                            const count = pcbs.filter(pcb => pcb.silicon_corner === corner && matchPcb(pcb, 'corner')).length;
                            if (count === 0 && hasAnyOtherFilter('corner') && !anyFieldDeselectedAll && !selectedCorners.includes(corner)) return null;
                            return <option key={corner} value={corner}>{corner} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>
                
            </PcbFilterGroup>

            {/* PCB Group */}
            <PcbFilterGroup title="PCB Filters" color={COLORS.purpleAccent}>
                <PcbFilterElement title="Name" value={selectedBoardNumbers} onChange={setSelectedBoardNumbers} width="150px">
                    {(anyFieldDeselectedAll ? pcbs : pcbs.filter(pcb => matchPcb(pcb, 'boardnum')))
                        .sort((a,b) => a.board_number.localeCompare(b.board_number))
                        .map(pcb => (
                            <option key={pcb.id} value={pcb.board_number}>{pcb.board_number}</option>
                        ))
                    }
                </PcbFilterElement>

                <PcbFilterElement title="Flavors" value={selectedFlavors} onChange={setSelectedFlavors}>
                    {(() => {
                        const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                        const allFlavors = new Set<string>();
                        activeProjects.forEach((p: any) => { if (p.flavors) p.flavors.forEach((ff: any) => allFlavors.add(ff.name)); });

                        return Array.from(allFlavors).sort().map(ff => {
                            const count = pcbs.filter(pcb => pcb.board_flavor === ff && matchPcb(pcb, 'flavor')).length;
                            if (count === 0 && hasAnyOtherFilter('flavor') && !anyFieldDeselectedAll && !selectedFlavors.includes(ff)) return null;
                            return <option key={ff} value={ff}>{ff} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>

                <PcbFilterElement title="Revs" value={selectedPcbRevs} onChange={setSelectedPcbRevs}>
                    {(() => {
                        const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                        const allPcbRevs = new Set<string>();
                        activeProjects.forEach((p: any) => { 
                            if (p.flavors) {
                                p.flavors.forEach((ff: any) => {
                                    if (ff.revisions) {
                                        ff.revisions.forEach((r: string) => allPcbRevs.add(r));
                                    }
                                });
                            }
                        });

                        return Array.from(allPcbRevs).sort().map(pr => {
                            const count = pcbs.filter(pcb => pcb.board_rev === pr && matchPcb(pcb, 'pcbrev')).length;
                            if (count === 0 && hasAnyOtherFilter('pcbrev') && !anyFieldDeselectedAll && !selectedPcbRevs.includes(pr)) return null;
                            return <option key={pr} value={pr}>{pr} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>

                <PcbFilterElement title="BOM" value={selectedBoms} onChange={setSelectedBoms}>
                    {(() => {
                        const allBoms = new Set<string>();
                        pcbs.forEach(pcb => {
                            if (pcb.bom) allBoms.add(pcb.bom);
                        });

                        return Array.from(allBoms).filter(Boolean).sort().map(b => {
                            const count = pcbs.filter(pcb => pcb.bom === b && matchPcb(pcb, 'bom')).length;
                            if (count === 0 && hasAnyOtherFilter('bom') && !anyFieldDeselectedAll && !selectedBoms.includes(b)) return null;
                            return <option key={b} value={b}>{b} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>
            </PcbFilterGroup>

            {/* Tags & Owner Group */}
            <PcbFilterGroup title="Organization" color="#0ea5e9">
                <PcbFilterElement 
                            title={
                                <span className="pfe-tooltip-wrapper">
                                    Tags 
                                    <span className="pfe-tooltip-icon">?</span>
                                    <div className="pfe-tooltip-content">
                                        <div className="pfe-tooltip-row">
                                            <div className="pfe-tooltip-box pfe-tooltip-ignored"></div>
                                            <span>Does not matter</span>
                                        </div>
                                        <div className="pfe-tooltip-row">
                                            <div className="pfe-tooltip-box pfe-tooltip-required">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                            </div>
                                            <span>Must have it</span>
                                        </div>
                                        <div className="pfe-tooltip-row">
                                            <div className="pfe-tooltip-box pfe-tooltip-excluded">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </div>
                                            <span>Must NOT have it</span>
                                        </div>
                                    </div>
                                </span>
                            }
                            threeStateMode
                            value={selectedTags}
                            requiredValue={requiredTags}
                            onChange={(newExcluded) => {
                                setSelectedTags(newExcluded);
                            }}
                            onRequiredChange={(newRequired) => {
                                setRequiredTags(newRequired);
                            }}
                        >
                    {(() => {
                        const publicTags = tags.filter((t: any) => t.type === 'public');
                        const grouped = new Map<string, any[]>();
                        publicTags.forEach((t: any) => {
                            const name = formatTagName(t);
                            if (!grouped.has(name)) grouped.set(name, []);
                            grouped.get(name)!.push(t);
                        });

                        return Array.from(grouped.entries()).map(([name, groupTags]) => {
                            const groupIds = groupTags.map(t => t.id);
                            const count = pcbs.filter(pcb => pcb.tag_ids && pcb.tag_ids.some(id => groupIds.includes(id)) && matchPcb(pcb, 'tag')).length;
                            const valueStr = groupIds.join(',');
                            if (count === 0 && hasAnyOtherFilter('tag') && !anyFieldDeselectedAll && !selectedTags.some(id => groupIds.includes(id))) return null;
                            return <option key={name} value={valueStr}>{name} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>

                <PcbFilterElement title="Owner" value={selectedOwners} onChange={setSelectedOwners}>
                    {owners.map(owner => {
                        const count = pcbs.filter(pcb => pcb.owner === owner.name && matchPcb(pcb, 'owner')).length;
                        if (count === 0 && hasAnyOtherFilter('owner') && !anyFieldDeselectedAll && !selectedOwners.includes(owner.name)) return null;
                        return <option key={owner.id} value={owner.name}>{owner.username} ({count})</option>;
                    })}
                </PcbFilterElement>
            </PcbFilterGroup>


        </div>
    );
}
