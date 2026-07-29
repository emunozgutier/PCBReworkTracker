import { PermissionCheckbox } from './PermissionCheckbox';

interface ActionItem {
    name: string;
    superUserAllowed: boolean;
    userAllowed: boolean;
    guestAllowed: boolean;
    isEditRow?: boolean;
    onGuestClick?: () => void;
    canEditGuest?: boolean;
}

interface RolePermissionSubTableProps {
    resourceName: string;
    rowSpan: number;
    actions: ActionItem[];
    currentUserRole: string;
}

export function RolePermissionSubTable({ resourceName, rowSpan, actions, currentUserRole }: RolePermissionSubTableProps) {
    return (
        <>
            {actions.map((action, idx) => (
                <tr key={action.name} className={action.isEditRow ? 'edit-row' : undefined}>
                    {idx === 0 && (
                        <td className="resource-cell" rowSpan={rowSpan}>
                            {resourceName}
                        </td>
                    )}
                    <td>{action.name}</td>
                    <PermissionCheckbox
                        allowed={action.superUserAllowed}
                        active={currentUserRole === 'Super User'}
                        canEdit={false}
                    />
                    <PermissionCheckbox
                        allowed={action.userAllowed}
                        active={currentUserRole === 'User'}
                        canEdit={false}
                    />
                    <PermissionCheckbox
                        allowed={action.guestAllowed}
                        active={currentUserRole === 'Guest'}
                        canEdit={!!action.canEditGuest}
                        onClick={action.onGuestClick}
                    />
                </tr>
            ))}
        </>
    );
}
