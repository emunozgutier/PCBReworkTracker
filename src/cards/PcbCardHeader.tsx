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
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', gap: '12px' }}
        >
            <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <span className="board-num" style={{ margin: 0, whiteSpace: 'nowrap' }}>{pcb.board_number}</span>

                <div style={{ display: 'flex', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {pcb.product || 'No Rev'} {pcb.bom ? ` • ${pcb.bom}` : ''} • {pcb.owner || 'Unassigned'}
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
