import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

interface ReworkCardHeaderProps {
    rework: any;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (id: number | string) => void;
}

export function ReworkCardHeader({ rework, isExpanded, onToggle, onEdit }: ReworkCardHeaderProps) {
    let imagePaths: string[] = [];
    if (rework.image_path) {
        try {
            imagePaths = JSON.parse(rework.image_path);
        } catch (e) {
            imagePaths = [rework.image_path];
        }
    }

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
                        {rework.title ? `${rework.title} (${rework.rework_name})` : (rework.rework_name || `Rework #${rework.id}`)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        PCB: {rework.pcb_board_number}
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        🧑‍🔧 {rework.owner_name ? rework.owner_name : 'Unassigned'}
                    </span>
                    {imagePaths.length > 0 && (
                        <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: '12px', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            {imagePaths.length}
                        </span>
                    )}
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
