import { CheckSquare, Square } from 'lucide-react';

interface PermissionCheckboxProps {
    allowed: boolean;
    active: boolean;
    canEdit: boolean;
    onClick?: () => void;
}

export function PermissionCheckbox({ allowed, active, canEdit, onClick }: PermissionCheckboxProps) {
    console.log("PermissionCheckbox render: allowed=", allowed, "active=", active, "canEdit=", canEdit, "hasOnClick=", !!onClick);
    return (
        <td
            className={`cb-cell ${active ? 'active-cell' : ''}`}
            onClick={canEdit ? onClick : undefined}
            style={canEdit ? { cursor: 'pointer', transition: 'background-color 0.2s' } : undefined}
            onMouseEnter={canEdit ? (e) => { e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'; } : undefined}
            onMouseLeave={canEdit ? (e) => { e.currentTarget.style.backgroundColor = ''; } : undefined}
        >
            {allowed ? (
                <CheckSquare size={16} className="allowed-cb" style={{ pointerEvents: 'none' }} />
            ) : (
                <Square size={16} className="denied-cb" style={{ pointerEvents: 'none' }} />
            )}
        </td>
    );
}
