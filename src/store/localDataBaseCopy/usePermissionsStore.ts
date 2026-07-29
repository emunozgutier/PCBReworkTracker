import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PermissionsStore {
    permissions: Record<string, boolean>;
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

export const usePermissionsStore = create<PermissionsStore>()(
    persist(
        (set) => ({
            permissions: { ...initialPermissions },
            setPermissions: (permissions) => set({ permissions }),
            resetPermissions: () => set({ permissions: { ...initialPermissions } }),
        }),
        {
            name: 'pcb-rework-tracker-permissions-state',
            storage: createJSONStorage(() => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    return window.localStorage;
                }
                return {
                    getItem: () => null,
                    setItem: () => {},
                    removeItem: () => {},
                };
            }),
        }
    )
);
