import { ChevronDown, ChevronUp } from 'lucide-react';

interface PcbCardHeaderProps {
    pcb: any;
    isExpanded: boolean;
    onToggle: () => void;
    hideActions?: boolean;
}

export function PcbCardHeader({ pcb, isExpanded, onToggle, hideActions }: PcbCardHeaderProps) {

    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: '10px' }}
        >
            {isExpanded && (
                <div style={{ display: 'flex', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {pcb.product || 'No Rev'} • {pcb.owner || 'Unassigned'}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>

                    <span className="board-num" style={{ margin: 0, whiteSpace: 'nowrap' }}>{pcb.board_number}</span>
                </div>

                {!hideActions && (
                    <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none', flexShrink: 0 }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                )}
            </div>
        </div>
    );
}
