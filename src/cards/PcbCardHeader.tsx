import { ChevronDown, ChevronUp, Edit2, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

interface PcbCardHeaderProps {
    pcb: any;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (id: number | string) => void;
    hideActions?: boolean;
}

export function PcbCardHeader({ pcb, isExpanded, onToggle, onEdit, hideActions }: PcbCardHeaderProps) {
    const { addItem } = useStore();

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
                    {!hideActions && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                                className="edit-button" 
                                onClick={(e) => { e.stopPropagation(); onEdit(pcb.id); }}
                                style={{ background: 'none', border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'static' }}
                                title="Edit PCB"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                className="edit-button" 
                                onClick={(e) => { e.stopPropagation(); addItem('reworks_add', pcb.id); }}
                                style={{ background: 'none', border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'static', color: 'var(--accent)' }}
                                title="Add Rework for this PCB"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    )}
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
