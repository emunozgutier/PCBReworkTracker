import { usePcbStore } from '../store/storePcb';
import { useProjectStore } from '../store/storeProject';
import { PcbFilterElement } from './PcbFilterElement';

export function PcbFilter() {
    const { 
        pcbs,
        selectedProjects, setSelectedProjects, 
        selectedRevisions, setSelectedRevisions, 
        selectedFlavors, setSelectedFlavors,
        selectedPcbRevs, setSelectedPcbRevs,
        selectedCorners, setSelectedCorners
    } = usePcbStore();
    
    const { projects } = useProjectStore();

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
            
            {/* Projects DigiKey-style Select */}
            {/* Projects DigiKey-style Select */}
            <PcbFilterElement title="Projects" value={selectedProjects} onChange={setSelectedProjects} width="220px">
                {projects.map(p => {
                    // Count how many pcbs belong to this project AND match the selected revisions and flavors
                    const count = pcbs.filter(pcb => 
                        pcb.project === p.name && 
                        (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                        (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                        (selectedCorners.length === 0 || selectedCorners.some(corner => p.silicon_corners && p.silicon_corners.includes(corner))) &&
                        (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr)))
                    ).length;
                    
                    // Only hide projects if we are actively filtering by a revision/flavor that this project doesn't have boards for
                    if ((selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedCorners.length > 0 || selectedPcbRevs.length > 0) && count === 0) return null;
                    
                    return <option key={p.id} value={p.id.toString()}>{p.name} ({count})</option>;
                })}
            </PcbFilterElement>

            {/* Silicon Revisions Box */}
            {/* Silicon Revisions Box */}
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
                            (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr)))
                        ).length;
                        if (count === 0 && selectedProjects.length > 0) return null;
                        return <option key={rev} value={rev}>{rev} ({count})</option>;
                    });
                })()}
            </PcbFilterElement>

            {/* PCB Flavors Box */}
            {/* PCB Flavors Box */}
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
                            (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr)))
                        ).length;
                        if (count === 0 && selectedProjects.length > 0) return null;
                        return <option key={ff} value={ff}>{ff} ({count})</option>;
                    });
                })()}
            </PcbFilterElement>

            {/* Silicon Corners Box */}
            {/* Silicon Corners Box */}
            <PcbFilterElement title="Silicon Corners" value={selectedCorners} onChange={setSelectedCorners}>
                {(() => {
                    const activeProjects = selectedProjects.length > 0 
                        ? projects.filter(p => selectedProjects.includes(p.id.toString()))
                        : projects;
                    
                    const allCorners = new Set<string>();
                    activeProjects.forEach((p: any) => {
                        if (p.silicon_corners) p.silicon_corners.split(',').forEach((c: string) => allCorners.add(c.trim()));
                    });

                    return Array.from(allCorners).filter(Boolean).sort().map(corner => {
                        const count = pcbs.filter(pcb => {
                            const p = projects.find(proj => proj.name === pcb.project);
                            return p && p.silicon_corners && p.silicon_corners.includes(corner) &&
                            (selectedProjects.length === 0 || selectedProjects.includes(p.id.toString())) &&
                            (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                            (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff)));
                        }).length;
                        if (count === 0 && selectedProjects.length > 0) return null;
                        return <option key={corner} value={corner}>{corner} ({count})</option>;
                    });
                })()}
            </PcbFilterElement>

            {/* PCB Revs Box */}
            {/* PCB Revs Box */}
            <PcbFilterElement title="PCB Revs" value={selectedPcbRevs} onChange={setSelectedPcbRevs}>
                {(() => {
                    // Extract unique PCB Revs from the "product_name_and_rev" string
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
                            (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff)))
                        ).length;
                        if (count === 0 && selectedProjects.length > 0) return null;
                        return <option key={pr} value={pr}>{pr} ({count})</option>;
                    });
                })()}
            </PcbFilterElement>

            {/* Clear Filters Button */}
            {(selectedProjects.length > 0 || selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedCorners.length > 0 || selectedPcbRevs.length > 0) && (
                <div style={{ alignSelf: 'flex-start', marginTop: '26px' }}>
                    <button 
                        onClick={() => { setSelectedProjects([]); setSelectedRevisions([]); setSelectedFlavors([]); setSelectedCorners([]); setSelectedPcbRevs([]); }}
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
