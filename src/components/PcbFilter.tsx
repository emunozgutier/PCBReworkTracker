import { usePcbStore } from '../store/storePcb';
import { useProjectStore } from '../store/storeProject';

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
                            (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                            (selectedCorners.length === 0 || selectedCorners.some(corner => p.silicon_corners && p.silicon_corners.includes(corner))) &&
                            (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr)))
                        ).length;
                        
                        // Only hide projects if we are actively filtering by a revision/flavor that this project doesn't have boards for
                        if ((selectedRevisions.length > 0 || selectedFlavors.length > 0 || selectedCorners.length > 0 || selectedPcbRevs.length > 0) && count === 0) return null;
                        
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
                        width: '110px', 
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
                                (selectedFlavors.length === 0 || selectedFlavors.some(ff => pcb.product && pcb.product.includes(ff))) &&
                                (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr)))
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
                        width: '110px', 
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
                                (selectedRevisions.length === 0 || selectedRevisions.some(rev => pcb.product && pcb.product.includes(rev))) &&
                                (selectedPcbRevs.length === 0 || selectedPcbRevs.some(pr => pcb.product && pcb.product.includes(pr)))
                            ).length;
                            if (count === 0 && selectedProjects.length > 0) return null;
                            return <option key={ff} value={ff}>{ff} ({count})</option>;
                        });
                    })()}
                </select>
            </div>

            {/* Silicon Corners Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Silicon Corners</span>
                <select 
                    multiple 
                    value={selectedCorners}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedCorners(selected);
                    }}
                    style={{ 
                        width: '110px', 
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
                </select>
            </div>

            {/* PCB Revs Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>PCB Revs</span>
                <select 
                    multiple 
                    value={selectedPcbRevs}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedPcbRevs(selected);
                    }}
                    style={{ 
                        width: '110px', 
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
                </select>
            </div>

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
