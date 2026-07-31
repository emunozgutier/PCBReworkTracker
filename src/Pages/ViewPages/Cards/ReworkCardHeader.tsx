import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppState } from '../../../store/useAppState';
import { usePcbStore } from '../../../store/clientDataBase/usePcbStore';
import { COLORS } from '../../../store/useStyles';
import { BoardName } from '../../../components/BoardName';
import { InfoPill } from '../../../components/InfoPill';

interface ReworkCardHeaderProps {
    rework: any;
    isExpanded: boolean;
    onToggle: () => void;
    showFullTitle?: boolean;
}

const getReworkTypeText = (type?: string) => {
    if (type === 'Resistor Option Swap' || type === 'Resistor Swap' || type === 'R swap') {
        return 'R Swap '.padEnd(7, ' ');
    }
    if (type === 'Silicon Swap') {
        return 'Si Swap'.padEnd(7, ' ');
    }
    const val = type || 'Minor';
    return val.padEnd(7, ' ');
};

const getReworkTypeTooltip = (type?: string) => {
    if (type === 'Major') {
        return 'some part is broken';
    }
    if (type === 'Silicon Swap') {
        return 'Silicon Swap';
    }
    if (type === 'Resistor Option Swap' || type === 'Resistor Swap' || type === 'R swap') {
        return 'a resistor option';
    }
    return 'it is working';
};

export function ReworkCardHeader({ rework, isExpanded, onToggle, showFullTitle = false }: ReworkCardHeaderProps) {
    const { isMobile } = useAppState();
    const { pcbs } = usePcbStore();

    const parentPcb = pcbs.find(p => p.id === rework.pcb_id);
    const resolvedBoardName = parentPcb ? parentPcb.board_number : (rework.board_number || rework.pcb_board_number || 'UNKNOWN');

    const reworkSuffix = `R${String(rework.rework_number || rework.id).padStart(3, '0')}`;

    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: '12px', minWidth: 0, width: '100%' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                    <span className="board-num" style={{ flexShrink: 0, margin: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {showFullTitle ? (
                            <>
                                <BoardName name={resolvedBoardName} />
                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                <InfoPill text={reworkSuffix} color={COLORS.purple} min_width={4} />
                            </>
                        ) : (
                            <InfoPill text={reworkSuffix} color={COLORS.purple} min_width={4} />
                        )}
                    </span>
                    <InfoPill 
                        text={getReworkTypeText(rework.rework_type)}
                        color={rework.rework_type === 'Major' ? COLORS.red : rework.rework_type === 'Silicon Swap' ? COLORS.purple : rework.rework_type === 'Resistor Option Swap' || rework.rework_type === 'Resistor Swap' || rework.rework_type === 'R swap' ? COLORS.orange : COLORS.indigo}
                        bg={rework.rework_type === 'Major' ? COLORS.redLight : rework.rework_type === 'Silicon Swap' ? COLORS.purpleMedium : rework.rework_type === 'Resistor Option Swap' || rework.rework_type === 'Resistor Swap' || rework.rework_type === 'R swap' ? COLORS.orangeMedium : COLORS.indigoLight}
                        border={`1px solid ${rework.rework_type === 'Major' ? COLORS.redBorder : rework.rework_type === 'Silicon Swap' ? COLORS.purpleBorder : rework.rework_type === 'Resistor Option Swap' || rework.rework_type === 'Resistor Swap' || rework.rework_type === 'R swap' ? COLORS.orangeBorder : COLORS.indigoBorder}`}
                        min_width={7}
                        title={getReworkTypeTooltip(rework.rework_type)}
                    />
                    {rework.title && !isMobile && (
                        <span style={{ 
                            flexShrink: 1, 
                            minWidth: 0,
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            color: 'var(--text-muted)'
                        }}>
                            {rework.title}
                        </span>
                    )}
                </div>
                {rework.title && isMobile && (
                    <div style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '0.85rem', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        width: '100%',
                        textAlign: 'left'
                    }}>
                        {rework.title}
                    </div>
                )}
            </div>

            <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none', flexShrink: 0 }}>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
        </div>
    );
}
