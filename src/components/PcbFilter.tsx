import { usePcbStore } from '../store/storePcb';
import { useProjectStore } from '../store/storeProject';
import { useTagStore } from '../store/storeTag';
import { useOwnerStore } from '../store/storeOwner';
import { PcbFilterElement } from './PcbFilterElement';

export function PcbFilter() {
    const { 
        pcbs,
        selectedProjects, setSelectedProjects, 
        selectedRevisions, setSelectedRevisions, 
        selectedFlavors, setSelectedFlavors,
        selectedPcbRevs, setSelectedPcbRevs,
        selectedTags, setSelectedTags,
        selectedOwners, setSelectedOwners
    } = usePcbStore();
    
    const { projects } = useProjectStore();
    const { tags } = useTagStore();
    const { owners } = useOwnerStore();

    return (
        <div className="pcb-filters" style={{  
            marginBottom: '24px', 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'flex-start', 
            overflowX: 'auto', 
            width: '100%',
            paddingBottom: '8px'
        }}>
            
            {/* (1) Projects Box */}
            <PcbFilterElement title="Projects" value={selectedProjects} onChange={setSelectedProjects} width="220px">
                {projects.map(p => {
                    const count = pcbs.filter(pcb => 
                        pcb.project === p.name && 
                        (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                        (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                        (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr))) &&
                        (selectedTags.length === 0 || selectedTags.some(tagId => pcb.tag_ids?.includes(parseInt(tagId)))) &&
                        (selectedOwners.length === 0 || selectedOwners.includes(pcb.owner))
                    ).length;
                    
                    if ((selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedPcbRevs.length > 0 || selectedTags.length > 0 || selectedOwners.length > 0) && count === 0) return null;
                    return <option key={p.id} value={p.id.toString()}>{p.name} ({count})</option>;
                })}
            </PcbFilterElement>

            {/* (2) Silicon Revisions Box */}
            <PcbFilterElement title="Silicon Revisions" value={selectedRevisions} onChange={setSelectedRevisions}>
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
                            (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                            (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr))) &&
                            (selectedTags.length === 0 || selectedTags.some(tagId => pcb.tag_ids?.includes(parseInt(tagId)))) &&
                            (selectedOwners.length === 0 || selectedOwners.includes(pcb.owner))
                        ).length;
                        if (count === 0 && (selectedProjects.length > 0 || selectedFlavors.length > 0 || selectedPcbRevs.length > 0 || selectedTags.length > 0 || selectedOwners.length > 0)) return null;
                        return <option key={rev} value={rev}>{rev} ({count})</option>;
                    });
                })()}
            </PcbFilterElement>

            {/* (3) PCB Flavors Box */}
            <PcbFilterElement title="PCB Flavors" value={selectedFlavors} onChange={setSelectedFlavors}>
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
                            (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                            (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr))) &&
                            (selectedTags.length === 0 || selectedTags.some(tagId => pcb.tag_ids?.includes(parseInt(tagId)))) &&
                            (selectedOwners.length === 0 || selectedOwners.includes(pcb.owner))
                        ).length;
                        if (count === 0 && (selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedPcbRevs.length > 0 || selectedTags.length > 0 || selectedOwners.length > 0)) return null;
                        return <option key={ff} value={ff}>{ff} ({count})</option>;
                    });
                })()}
            </PcbFilterElement>

            {/* (4) PCB Revs Box */}
            <PcbFilterElement title="PCB Revs" value={selectedPcbRevs} onChange={setSelectedPcbRevs}>
                {(() => {
                    const allPcbRevs = new Set<string>();
                    pcbs.forEach(pcb => {
                        if (!pcb.product) return;
                        const p = projects.find(proj => proj.name === pcb.project);
                        let revStr = pcb.product;
                        if (p) {
                            if (p.formfactors) p.formfactors.forEach((ff: any) => { revStr = revStr.replace(ff.name, ''); });
                            if (p.revisions) p.revisions.forEach((r: string) => { revStr = revStr.replace(r, ''); });
                        }
                        const cleanRev = revStr.trim();
                        if (cleanRev) allPcbRevs.add(cleanRev);
                    });

                    return Array.from(allPcbRevs).sort().map(pr => {
                        const count = pcbs.filter(pcb => 
                            (pcb.product && pcb.product.includes(pr)) &&
                            (selectedProjects.length === 0 || selectedProjects.includes(projects.find(p => p.name === pcb.project)?.id.toString() || '')) &&
                            (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                            (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                            (selectedTags.length === 0 || selectedTags.some(tagId => pcb.tag_ids?.includes(parseInt(tagId)))) &&
                            (selectedOwners.length === 0 || selectedOwners.includes(pcb.owner))
                        ).length;
                        if (count === 0 && (selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedTags.length > 0 || selectedOwners.length > 0)) return null;
                        return <option key={pr} value={pr}>{pr} ({count})</option>;
                    });
                })()}
            </PcbFilterElement>

            {/* (5) Tags Box */}
            <PcbFilterElement title="Tags" value={selectedTags} onChange={setSelectedTags}>
                {tags.map(tag => {
                    const count = pcbs.filter(pcb => 
                        (pcb.tag_ids && pcb.tag_ids.includes(tag.id)) &&
                        (selectedProjects.length === 0 || selectedProjects.includes(projects.find(p => p.name === pcb.project)?.id.toString() || '')) &&
                        (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                        (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                        (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr))) &&
                        (selectedOwners.length === 0 || selectedOwners.includes(pcb.owner))
                    ).length;
                    if (count === 0 && (selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedPcbRevs.length > 0 || selectedOwners.length > 0)) return null;
                    return <option key={tag.id} value={tag.id.toString()}>{tag.name} ({count})</option>;
                })}
            </PcbFilterElement>

            {/* (6) Owner Box */}
            <PcbFilterElement title="Owner" value={selectedOwners} onChange={setSelectedOwners}>
                {owners.map(owner => {
                    const count = pcbs.filter(pcb => 
                        pcb.owner === owner.name &&
                        (selectedProjects.length === 0 || selectedProjects.includes(projects.find(p => p.name === pcb.project)?.id.toString() || '')) &&
                        (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                        (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                        (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr))) &&
                        (selectedTags.length === 0 || selectedTags.some(tagId => pcb.tag_ids?.includes(parseInt(tagId))))
                    ).length;
                    if (count === 0 && (selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedPcbRevs.length > 0 || selectedTags.length > 0)) return null;
                    return <option key={owner.id} value={owner.name}>{owner.name} ({count})</option>;
                })}
            </PcbFilterElement>

            {/* Clear Filters Button */}
            {(selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedTags.length > 0 || selectedOwners.length > 0 || selectedPcbRevs.length > 0) && (
                <div style={{ alignSelf: 'flex-start', marginTop: '26px' }}>
                    <button 
                        onClick={() => { setSelectedProjects([]); setSelectedRevisions([]); setSelectedFlavors([]); setSelectedPcbRevs([]); setSelectedTags([]); setSelectedOwners([]); }}
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
    );
}
