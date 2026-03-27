import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

interface ReworkCardHeaderProps {
    rework: any;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (id: number | string) => void;
}

export function ReworkCardHeader({ rework, isExpanded, onToggle, onEdit }: ReworkCardHeaderProps) {
    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: '16px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <button 
                    className="edit-button" 
                    onClick={(e) => { e.stopPropagation(); onEdit(rework.id); }}
                    style={{ background: 'none', border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'static' }}
                    title="Edit Rework"
                >
                    <Edit2 size={16} />
                </button>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', minWidth: 0 }}>
                    <span className="board-num" style={{ margin: 0, whiteSpace: 'nowrap', color: 'var(--accent)' }}>
                        {rework.rework_name || `Rework #${rework.id}`}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        PCB: {rework.pcb_board_number}
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        🧑‍🔧 {rework.owner_name ? rework.owner_name : 'Unassigned'}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>
        </div>
    );
}
