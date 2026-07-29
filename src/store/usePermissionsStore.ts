import { create } from 'zustand';

export interface ActionItem {
    name: string;
    superUserAllowed: boolean;
    userAllowed: boolean;
    guestAllowed: boolean;
    isEditRow?: boolean;
    canEditGuest?: boolean;
    onGuestClick?: () => void;
}

interface PermissionsStore {
    localGuestMinorRework: boolean;
    setLocalGuestMinorRework: (val: boolean) => void;
    toggleLocalGuestMinorRework: () => void;
}

export const usePermissionsStore = create<PermissionsStore>((set) => ({
    localGuestMinorRework: true, // defaults to true
    setLocalGuestMinorRework: (val) => set({ localGuestMinorRework: val }),
    toggleLocalGuestMinorRework: () => set((state) => ({ localGuestMinorRework: !state.localGuestMinorRework })),
}));

export function usePermissionsTable() {
    const localGuestMinorRework = usePermissionsStore((state) => state.localGuestMinorRework);
    const toggleLocalGuestMinorRework = usePermissionsStore((state) => state.toggleLocalGuestMinorRework);

    const projectActions: ActionItem[] = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Edit', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const pcbActions: ActionItem[] = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: true, guestAllowed: false },
        { name: 'Edit', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const reworkActions: ActionItem[] = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add High Priority', superUserAllowed: true, userAllowed: true, guestAllowed: false },
        { 
            name: 'Add Low Priority', 
            superUserAllowed: true, 
            userAllowed: true, 
            guestAllowed: localGuestMinorRework,
            canEditGuest: true,
            onGuestClick: toggleLocalGuestMinorRework
        },
        { name: 'Edit Own', superUserAllowed: true, userAllowed: true, guestAllowed: false, isEditRow: true },
        { name: 'Edit Others', superUserAllowed: true, userAllowed: false, guestAllowed: false, isEditRow: true },
        { name: 'Delete Own', superUserAllowed: true, userAllowed: true, guestAllowed: false },
        { name: 'Delete Others', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const userActions: ActionItem[] = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Edit Own', superUserAllowed: true, userAllowed: true, guestAllowed: false, isEditRow: true },
        { name: 'Edit Others', superUserAllowed: true, userAllowed: false, guestAllowed: false, isEditRow: true },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const tagActions: ActionItem[] = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Edit', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    return {
        projectActions,
        pcbActions,
        reworkActions,
        userActions,
        tagActions,
    };
}
