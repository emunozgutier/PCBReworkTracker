import { ChevronDown, ChevronUp } from 'lucide-react';
import { BoardName } from '../../../components/BoardName';
import { COLORS } from '../../../store/useStyles';
import { InfoPill } from '../../../components/InfoPill';

interface PcbCardHeaderProps {
    pcb: any;
    isExpanded: boolean;
    onToggle: () => void;
    hideActions?: boolean;
    maxCrcLength?: number;
}

export function PcbCardHeader({ pcb, isExpanded, onToggle, hideActions, maxCrcLength }: PcbCardHeaderProps) {

    const flavor = (pcb.board_flavor || '').replace('No part yet', 'No part');
    const revText = pcb.board_rev || '';
    const pcbPillText = [flavor, revText].filter(Boolean).join(' ') || 'No PCB Info';

    const siInfo = [pcb.silicon_rev, pcb.silicon_corner].filter(Boolean).join(' ');

    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', gap: '12px' }}
        >
            <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <span className="board-num" style={{ margin: 0, whiteSpace: 'nowrap' }}><BoardName name={pcb.board_number} isHex={pcb.number_format === 'hex'} maxCrcLength={maxCrcLength} /></span>

                {/* Silicon Info Pill (Si Rev + Corner) - directly inline with board number */}
                {siInfo && (
                    <InfoPill text={siInfo} color={COLORS.purple} />
                )}

                <InfoPill text={pcbPillText} color="var(--text-muted)" />
            </div>

            {!hideActions && (
                <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none', flexShrink: 0, marginTop: '2px' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            )}
        </div>
    );
}
