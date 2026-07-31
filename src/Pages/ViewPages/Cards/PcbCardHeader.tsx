import { useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { BoardName } from '../../../components/BoardName';
import { useAppState } from '../../../store/useAppState';
import { COLORS } from '../../../store/useStyles';
import { InfoPill } from '../../../components/InfoPill';
import { useProjectStore } from '../../../store/clientDataBase/useProjectStore';
import { API_BASE } from '../../../store/serverDataBase/apiBridge';

interface PcbCardHeaderProps {
    pcb: any;
    isExpanded: boolean;
    onToggle: () => void;
    hideActions?: boolean;
}

export function PcbCardHeader({ pcb, isExpanded, onToggle, hideActions }: PcbCardHeaderProps) {
    const { isMobile } = useAppState();
    const { projects, projectSchematics, fetchSchematics } = useProjectStore();

    const project = projects.find(p => p.id === pcb.project_id);

    let schematicFilename = '';
    if (project && pcb.board_flavor && pcb.board_rev) {
        const ff = project.flavors?.find(f => f.name === pcb.board_flavor);
        if (ff && ff.revisionDetails) {
            const revDetail = ff.revisionDetails.find(r => r.name === pcb.board_rev);
            if (revDetail && revDetail.schematic) {
                schematicFilename = revDetail.schematic;
            }
        }
    }

    const schematics = project ? (projectSchematics[project.id.toString()] || []) : [];
    const schematic = schematics.find(s => s.filename === schematicFilename);

    useEffect(() => {
        if (project && !projectSchematics[project.id.toString()]) {
            fetchSchematics(project.id);
        }
    }, [project, projectSchematics, fetchSchematics]);

    const flavor = (pcb.board_flavor || '').replace('No part yet', 'No part');
    const revText = pcb.board_rev ? `Rev ${pcb.board_rev}` : '';
    const pcbPillText = [flavor, revText, pcb.bom].filter(Boolean).join(' ') || 'No PCB Info';

    const siInfo = [pcb.silicon_rev, pcb.silicon_corner].filter(Boolean).join(' ');

    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', gap: '12px' }}
        >
            <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <span className="board-num" style={{ margin: 0, whiteSpace: 'nowrap' }}><BoardName name={pcb.board_number} isHex={pcb.number_format === 'hex'} /></span>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                    {/* Silicon Info Pill (Si Rev + Corner) */}
                    {siInfo && (
                        <InfoPill text={siInfo} color={COLORS.purple} />
                    )}

                    {/* PCB Info Pill (Flavor + Rev + BOM) */}
                    <InfoPill text={pcbPillText} color="var(--text-muted)" />

                    {/* Schematic Pill Link */}
                    {schematic && (
                        <a 
                            href={schematic.path.startsWith('http') ? schematic.path : `${API_BASE.replace('/api', '')}/api${schematic.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                textDecoration: 'none',
                                color: 'var(--accent)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: 'rgba(99, 102, 241, 0.08)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                transition: 'all 0.2s',
                            }}
                            title={`View schematic: ${schematic.filename}`}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                e.currentTarget.style.borderColor = 'var(--accent)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                            }}
                        >
                            <FileText size={12} />
                            <span>Schematic</span>
                        </a>
                    )}

                    {/* Owner Info Pill */}
                    {!isMobile && (
                        <InfoPill 
                            text={pcb.owner_username ? `@${pcb.owner_username}` : (pcb.owner || 'Unassigned')} 
                            color="var(--text-muted)" 
                        />
                    )}
                </div>
            </div>

            {!hideActions && (
                <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none', flexShrink: 0, marginTop: '2px' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            )}
        </div>
    );
}
