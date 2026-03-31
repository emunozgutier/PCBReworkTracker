import { ChevronDown, ChevronUp } from 'lucide-react';
import { BoardName } from '../../components/BoardName';

interface ReworkCardHeaderProps {
    rework: any;
    isExpanded: boolean;
    onToggle: () => void;
    showFullTitle?: boolean;
}

export function ReworkCardHeader({ rework, isExpanded, onToggle, showFullTitle = false }: ReworkCardHeaderProps) {
    let imagePaths: string[] = [];
    if (rework.image_path) {
        try {
            imagePaths = JSON.parse(rework.image_path);
        } catch (e) {
            imagePaths = [rework.image_path];
        }
    }

    const shortName = (rework.rework_name && !showFullTitle)
        ? rework.rework_name.replace(new RegExp(`^${rework.board_number || rework.pcb_board_number || '.*'}-`), '')
        : (rework.rework_name || (showFullTitle ? `${rework.board_number || rework.pcb_board_number || 'UNKNOWN'}-R-${String(rework.id).padStart(3, '0')}` : `R-${String(rework.id).padStart(3, '0')}`));

    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: '12px', minWidth: 0, width: '100%' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, flex: 1 }}>
                <span className="board-num" style={{ display: 'block', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--accent)', width: '100%' }}>
                    {rework.title 
                        ? `${shortName}: ${rework.title}`
                        : shortName}
                </span>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        PCB: <BoardName name={rework.board_number || rework.pcb_board_number} />
                    </span>
                    <span style={{ fontSize: '0.8rem', background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
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

            <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none', flexShrink: 0 }}>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
        </div>
    );
}
