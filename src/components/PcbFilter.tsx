import { usePcbStore } from '../store/storePcb';
import { useProjectStore } from '../store/storeProject';
import { useTagStore, formatTagName } from '../store/storeTag';
import { useOwnerStore } from '../store/storeOwner';
import { PcbFilterElement } from './PcbFilterElement';
import { PcbFilterGroup } from './PcbFilterGroup';

export function PcbFilter() {
    const { 
        pcbs,
        selectedProjects, setSelectedProjects, 
        selectedRevisions, setSelectedRevisions, 
        selectedCorners, setSelectedCorners,
        selectedFlavors, setSelectedFlavors,
        selectedPcbRevs, setSelectedPcbRevs,
        selectedTags, setSelectedTags,
        selectedOwners, setSelectedOwners,
        selectedBoardNumbers, setSelectedBoardNumbers,
        selectedBoms, setSelectedBoms
    } = usePcbStore();
    
    const { projects } = useProjectStore();
    const { tags } = useTagStore();
    const { owners } = useOwnerStore();

    // Helper to evaluate a PCB against all filters except the one currently generating options
    const matchPcb = (pcb: any, ignoreField: 'project' | 'revision' | 'corner' | 'flavor' | 'pcbrev' | 'tag' | 'owner' | 'boardnum' | 'bom') => {
        if (ignoreField !== 'project' && selectedProjects.length > 0) {
            const pObj = projects.find(p => p.name === pcb.project);
            if (!pObj || !selectedProjects.includes(pObj.id.toString())) return false;
        }
        if (ignoreField !== 'revision' && selectedRevisions.length > 0) {
            if (!pcb.product || !selectedRevisions.some((rev: string) => pcb.product.includes(rev))) return false;
        }
        if (ignoreField !== 'corner' && selectedCorners.length > 0) {
            if (!pcb.product || !selectedCorners.some((corner: string) => pcb.product.includes(corner))) return false;
        }
        if (ignoreField !== 'flavor' && selectedFlavors.length > 0) {
            if (!pcb.product || !selectedFlavors.some((ff: string) => pcb.product.includes(ff))) return false;
        }
        if (ignoreField !== 'pcbrev' && selectedPcbRevs.length > 0) {
            if (!pcb.product || !selectedPcbRevs.some((pr: string) => pcb.product.includes(pr))) return false;
        }
        if (ignoreField !== 'tag' && selectedTags.length > 0) {
            if (!pcb.tag_ids || !selectedTags.some((tagId: string) => pcb.tag_ids?.includes(parseInt(tagId)))) return false;
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
            tag: selectedTags.length > 0,
            owner: selectedOwners.length > 0,
            boardnum: selectedBoardNumbers.length > 0,
            bom: selectedBoms.length > 0
        };
        // @ts-ignore
        filters[ignoreField] = false;
        return Object.values(filters).some(Boolean);
    };

    return (
        <div className="pcb-filters" style={{  
            marginBottom: '24px', 
            display: 'flex', 
            gap: '24px', 
            alignItems: 'stretch', 
            overflowX: 'auto', 
            width: '100%',
            paddingBottom: '12px'
        }}>
            
            {/* Silicon Group */}
            <PcbFilterGroup title="Silicon Filters" color="#8b5cf6">
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

                        return Array.from(allRevs).sort().map(rev => {
                            const count = pcbs.filter(pcb => pcb.product && pcb.product.includes(rev) && matchPcb(pcb, 'revision')).length;
                            if (count === 0 && hasAnyOtherFilter('revision')) return null;
                            return <option key={rev} value={rev}>{rev} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>

                <PcbFilterElement title="Corners" value={selectedCorners} onChange={setSelectedCorners}>
                    {(() => {
                        const activeProjects = selectedProjects.length > 0 ? projects.filter(p => selectedProjects.includes(p.id.toString())) : projects;
                        const allCorners = new Set<string>();
                        activeProjects.forEach((p: any) => { if (p.silicon_corners) p.silicon_corners.split(',').forEach((c: string) => allCorners.add(c.trim())); });

                        return Array.from(allCorners).filter(Boolean).sort().map(corner => {
                            const count = pcbs.filter(pcb => pcb.product && pcb.product.includes(corner) && matchPcb(pcb, 'corner')).length;
                            if (count === 0 && hasAnyOtherFilter('corner')) return null;
                            return <option key={corner} value={corner}>{corner} ({count})</option>;
                        });
                    })()}
                </PcbFilterElement>
                
            </PcbFilterGroup>

            {/* PCB Group */}
            <PcbFilterGroup title="PCB Filters" color="#8b5cf6">
                <PcbFilterElement title="Name" value={selectedBoardNumbers} onChange={setSelectedBoardNumbers}>
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
                        activeProjects.forEach((p: any) => { if (p.formfactors) p.formfactors.forEach((ff: any) => allFlavors.add(ff.name)); });

                        return Array.from(allFlavors).sort().map(ff => {
                            const count = pcbs.filter(pcb => pcb.product && pcb.product.includes(ff) && matchPcb(pcb, 'flavor')).length;
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
                            if (p.formfactors) {
                                p.formfactors.forEach((ff: any) => {
                                    if (ff.revisions) {
                                        ff.revisions.forEach((r: string) => allPcbRevs.add(r));
                                    }
                                });
                            }
                        });

                        return Array.from(allPcbRevs).sort().map(pr => {
                            const count = pcbs.filter(pcb => pcb.product && pcb.product.includes(pr) && matchPcb(pcb, 'pcbrev')).length;
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
            </PcbFilterGroup>

            {/* Tags & Owner Group */}
            <PcbFilterGroup title="Organization" color="#0ea5e9">
                <PcbFilterElement 
                    title="Public Tags" 
                    value={selectedTags.filter(id => tags.find(t => t.id.toString() === id)?.type === 'public')} 
                    onChange={(newPublic) => {
                        const personalTagsSelected = selectedTags.filter(id => tags.find(t => t.id.toString() === id)?.type === 'personal');
                        setSelectedTags([...personalTagsSelected, ...newPublic]);
                    }}
                >
                    {tags.filter(t => t.type === 'public').map(tag => {
                        const count = pcbs.filter(pcb => pcb.tag_ids && pcb.tag_ids.includes(tag.id) && matchPcb(pcb, 'tag')).length;
                        if (count === 0 && hasAnyOtherFilter('tag')) return null;
                        return <option key={tag.id} value={tag.id.toString()}>{formatTagName(tag)} ({count})</option>;
                    })}
                </PcbFilterElement>

                <PcbFilterElement 
                    title="Personal Tags" 
                    value={selectedTags.filter(id => tags.find(t => t.id.toString() === id)?.type === 'personal')} 
                    onChange={(newPersonal) => {
                        const publicTagsSelected = selectedTags.filter(id => tags.find(t => t.id.toString() === id)?.type === 'public');
                        setSelectedTags([...publicTagsSelected, ...newPersonal]);
                    }}
                >
                    {tags.filter(t => t.type === 'personal').map(tag => {
                        const count = pcbs.filter(pcb => pcb.tag_ids && pcb.tag_ids.includes(tag.id) && matchPcb(pcb, 'tag')).length;
                        if (count === 0 && hasAnyOtherFilter('tag')) return null;
                        return <option key={tag.id} value={tag.id.toString()}>{formatTagName(tag)} ({count})</option>;
                    })}
                </PcbFilterElement>

                <PcbFilterElement title="Owner" value={selectedOwners} onChange={setSelectedOwners}>
                    {owners.map(owner => {
                        const count = pcbs.filter(pcb => pcb.owner === owner.name && matchPcb(pcb, 'owner')).length;
                        if (count === 0 && hasAnyOtherFilter('owner')) return null;
                        return <option key={owner.id} value={owner.name}>{owner.username} ({count})</option>;
                    })}
                </PcbFilterElement>
            </PcbFilterGroup>


        </div>
    );
}
