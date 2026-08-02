import { ChevronDown, ChevronUp } from 'lucide-react';
import { BoardName } from '../../../components/BoardName';
import { useAppState } from '../../../store/useAppState';
import { COLORS } from '../../../store/useStyles';
import { InfoPill } from '../../../components/InfoPill';

interface PcbCardHeaderProps {
    pcb: any;
    isExpanded: boolean;
    onToggle: () => void;
    hideActions?: boolean;
}

export function PcbCardHeader({ pcb, isExpanded, onToggle, hideActions }: PcbCardHeaderProps) {
    const { isMobile } = useAppState();

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

                {/* Silicon Info Pill (Si Rev + Corner) - directly inline with board number */}
                {siInfo && (
                    <InfoPill text={siInfo} color={COLORS.purple} />
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                    {/* PCB Info Pill (Flavor + Rev + BOM) */}
                    <InfoPill text={pcbPillText} color="var(--text-muted)" />

                    {/* Owner Info Pill */}
                    {!isMobile && (
                        <InfoPill 
                            text={(pcb.owner_username ? `@${pcb.owner_username}` : (pcb.owner || 'Unassigned')).substring(0, 8)} 
                            color="var(--text-muted)" 
                            min_width={8}
                            center={true}
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
