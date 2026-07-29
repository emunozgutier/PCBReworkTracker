import { create } from 'zustand';

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

interface PermissionsStore {
    permissions: Record<string, boolean>;
    togglePermission: (resource: string, action: string, role: 'superUser' | 'user' | 'guest') => void;
    setPermissions: (perms: Record<string, boolean>) => void;
    resetPermissions: () => void;
}

const initialPermissions: Record<string, boolean> = {
    // Projects
    'Projects__View__superUser': true, 'Projects__View__user': true, 'Projects__View__guest': true,
    'Projects__Add__superUser': true, 'Projects__Add__user': false, 'Projects__Add__guest': false,
    'Projects__Edit__superUser': true, 'Projects__Edit__user': false, 'Projects__Edit__guest': false,
    'Projects__Delete__superUser': true, 'Projects__Delete__user': false, 'Projects__Delete__guest': false,

    // PCBs
    'PCBs__View__superUser': true, 'PCBs__View__user': true, 'PCBs__View__guest': true,
    'PCBs__Add__superUser': true, 'PCBs__Add__user': true, 'PCBs__Add__guest': false,
    'PCBs__Edit__superUser': true, 'PCBs__Edit__user': false, 'PCBs__Edit__guest': false,
    'PCBs__Delete__superUser': true, 'PCBs__Delete__user': false, 'PCBs__Delete__guest': false,

    // Reworks
    'Reworks__View__superUser': true, 'Reworks__View__user': true, 'Reworks__View__guest': true,
    'Reworks__Add High Priority__superUser': true, 'Reworks__Add High Priority__user': true, 'Reworks__Add High Priority__guest': false,
    'Reworks__Add Low Priority__superUser': true, 'Reworks__Add Low Priority__user': true, 'Reworks__Add Low Priority__guest': true,
    'Reworks__Edit Own__superUser': true, 'Reworks__Edit Own__user': true, 'Reworks__Edit Own__guest': false,
    'Reworks__Edit Others__superUser': true, 'Reworks__Edit Others__user': false, 'Reworks__Edit Others__guest': false,
    'Reworks__Delete Own__superUser': true, 'Reworks__Delete Own__user': true, 'Reworks__Delete Own__guest': false,
    'Reworks__Delete Others__superUser': true, 'Reworks__Delete Others__user': false, 'Reworks__Delete Others__guest': false,

    // Users
    'Users__View__superUser': true, 'Users__View__user': true, 'Users__View__guest': true,
    'Users__Add__superUser': true, 'Users__Add__user': true, 'Users__Add__guest': true,
    'Users__Edit Own__superUser': true, 'Users__Edit Own__user': true, 'Users__Edit Own__guest': false,
    'Users__Edit Others__superUser': true, 'Users__Edit Others__user': false, 'Users__Edit Others__guest': false,
    'Users__Delete__superUser': true, 'Users__Delete__user': false, 'Users__Delete__guest': false,

    // Tags
    'Tags__View__superUser': true, 'Tags__View__user': true, 'Tags__View__guest': true,
    'Tags__Add__superUser': true, 'Tags__Add__user': false, 'Tags__Add__guest': false,
    'Tags__Edit__superUser': true, 'Tags__Edit__user': false, 'Tags__Edit__guest': false,
    'Tags__Delete__superUser': true, 'Tags__Delete__user': false, 'Tags__Delete__guest': false,
};

export const usePermissionsStore = create<PermissionsStore>((set) => ({
    permissions: { ...initialPermissions },
    togglePermission: (resource, action, role) => set((state) => {
        const key = `${resource}__${action}__${role}`;
        return {
            permissions: {
                ...state.permissions,
                [key]: !state.permissions[key]
            }
        };
    }),
    setPermissions: (perms) => set({ permissions: perms }),
    resetPermissions: () => set({ permissions: { ...initialPermissions } }),
}));

export function usePermissionsTable() {
    const permissions = usePermissionsStore((state) => state.permissions);
    const togglePermission = usePermissionsStore((state) => state.togglePermission);

    const buildActions = (resource: string, list: { name: string; isEditRow?: boolean }[]): ActionItem[] => {
        return list.map((item) => {
            const superUserAllowed = !!permissions[`${resource}__${item.name}__superUser`];
            const userAllowed = !!permissions[`${resource}__${item.name}__user`];
            const guestAllowed = !!permissions[`${resource}__${item.name}__guest`];
            
            return {
                name: item.name,
                superUserAllowed,
                userAllowed,
                guestAllowed,
                isEditRow: item.isEditRow,
                onSuperUserClick: () => togglePermission(resource, item.name, 'superUser'),
                onUserClick: () => togglePermission(resource, item.name, 'user'),
                onGuestClick: () => togglePermission(resource, item.name, 'guest'),
            };
        });
    };

    const projectActions = buildActions('Projects', [
        { name: 'View' },
        { name: 'Add' },
        { name: 'Edit' },
        { name: 'Delete' },
    ]);

    const pcbActions = buildActions('PCBs', [
        { name: 'View' },
        { name: 'Add' },
        { name: 'Edit' },
        { name: 'Delete' },
    ]);

    const reworkActions = buildActions('Reworks', [
        { name: 'View' },
        { name: 'Add High Priority' },
        { name: 'Add Low Priority' },
        { name: 'Edit Own', isEditRow: true },
        { name: 'Edit Others', isEditRow: true },
        { name: 'Delete Own' },
        { name: 'Delete Others' },
    ]);

    const userActions = buildActions('Users', [
        { name: 'View' },
        { name: 'Add' },
        { name: 'Edit Own', isEditRow: true },
        { name: 'Edit Others', isEditRow: true },
        { name: 'Delete' },
    ]);

    const tagActions = buildActions('Tags', [
        { name: 'View' },
        { name: 'Add' },
        { name: 'Edit' },
        { name: 'Delete' },
    ]);

    return {
        projectActions,
        pcbActions,
        reworkActions,
        userActions,
        tagActions,
    };
}
