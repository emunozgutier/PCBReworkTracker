import { PermissionCheckbox } from './PermissionCheckbox';

export interface ActionItem {
    name: string;
    superUserAllowed: boolean;
    userAllowed: boolean;
    guestAllowed: boolean;
    isEditRow?: boolean;
    onSuperUserClick?: () => void;
    onUserClick?: () => void;
    onGuestClick?: () => void;
}

interface RolePermissionSubTableProps {
    actions: ActionItem[];
    currentUserRole: string;
    isSuperUser: boolean;
}

export function RolePermissionSubTable({ actions, currentUserRole, isSuperUser }: RolePermissionSubTableProps) {
    return (
        <>
            {actions.map((action) => (
                <tr key={action.name} className={action.isEditRow ? 'edit-row' : undefined}>
                    <td>{action.name}</td>
                    <PermissionCheckbox
                        allowed={action.superUserAllowed}
                        active={currentUserRole === 'Super User'}
                        canEdit={isSuperUser}
                        onClick={action.onSuperUserClick}
                    />
                    <PermissionCheckbox
                        allowed={action.userAllowed}
                        active={currentUserRole === 'User'}
                        canEdit={isSuperUser}
                        onClick={action.onUserClick}
                    />
                    <PermissionCheckbox
                        allowed={action.guestAllowed}
                        active={currentUserRole === 'Guest'}
                        canEdit={isSuperUser}
                        onClick={action.onGuestClick}
                    />
                </tr>
            ))}
        </>
    );
}
