import { create } from 'zustand';
import { API_BASE, apiFetch } from '../serverDataBase/apiBridge';
import { useAppState } from '../useAppState';

interface PermissionsStore {
    permissions: Record<string, boolean>;
    setPermissions: (perms: Record<string, boolean>) => Promise<void>;
    resetPermissions: () => Promise<void>;
    fetchPermissions: () => Promise<void>;
}

const initialPermissions: Record<string, boolean> = {
    // Projects
    'Projects__View__superUser': true, 'Projects__View__user': true, 'Projects__View__guest': true,
    'Projects__Add__superUser': true, 'Projects__Add__user': false, 'Projects__Add__guest': true,
    'Projects__Edit__superUser': true, 'Projects__Edit__user': false, 'Projects__Edit__guest': true,
    'Projects__Delete__superUser': true, 'Projects__Delete__user': false, 'Projects__Delete__guest': true,

    // PCBs
    'PCBs__View__superUser': true, 'PCBs__View__user': true, 'PCBs__View__guest': true,
    'PCBs__Add__superUser': true, 'PCBs__Add__user': true, 'PCBs__Add__guest': true,
    'PCBs__Edit__superUser': true, 'PCBs__Edit__editRow': true, 'PCBs__Edit__editOthers': false,
    'PCBs__Edit__user': false, 'PCBs__Edit__guest': true,
    'PCBs__Delete__superUser': true, 'PCBs__Delete__user': false, 'PCBs__Delete__guest': true,

    // Reworks
    'Reworks__View__superUser': true, 'Reworks__View__user': true, 'Reworks__View__guest': true,
    'Reworks__Add High Priority__superUser': true, 'Reworks__Add High Priority__user': true, 'Reworks__Add High Priority__guest': true,
    'Reworks__Add Low Priority__superUser': true, 'Reworks__Add Low Priority__user': true, 'Reworks__Add Low Priority__guest': true,
    'Reworks__Edit Own__superUser': true, 'Reworks__Edit Own__user': true, 'Reworks__Edit Own__guest': true,
    'Reworks__Edit Others__superUser': true, 'Reworks__Edit Others__user': false, 'Reworks__Edit Others__guest': true,
    'Reworks__Delete Own__superUser': true, 'Reworks__Delete Own__user': true, 'Reworks__Delete Own__guest': true,
    'Reworks__Delete Others__superUser': true, 'Reworks__Delete Others__user': false, 'Reworks__Delete Others__guest': true,

    // Users
    'Users__View__superUser': true, 'Users__View__user': true, 'Users__View__guest': true,
    'Users__Add__superUser': true, 'Users__Add__user': true, 'Users__Add__guest': true,
    'Users__Edit Own__superUser': true, 'Users__Edit Own__user': true, 'Users__Edit Own__guest': true,
    'Users__Edit Others__superUser': true, 'Users__Edit Others__user': false, 'Users__Edit Others__guest': true,
    'Users__Delete__superUser': true, 'Users__Delete__user': false, 'Users__Delete__guest': true,

    // Tags
    'Tags__View__superUser': true, 'Tags__View__user': true, 'Tags__View__guest': true,
    'Tags__Add__superUser': true, 'Tags__Add__user': false, 'Tags__Add__guest': true,
    'Tags__Edit__superUser': true, 'Tags__Edit__user': false, 'Tags__Edit__guest': true,
    'Tags__Delete__superUser': true, 'Tags__Delete__user': false, 'Tags__Delete__guest': true,

    // Docs
    'Docs__View__superUser': true, 'Docs__View__user': true, 'Docs__View__guest': true,
    'Docs__Add__superUser': true, 'Docs__Add__user': false, 'Docs__Add__guest': true,
    'Docs__Delete__superUser': true, 'Docs__Delete__user': false, 'Docs__Delete__guest': true,
};

export const usePermissionsStore = create<PermissionsStore>((set) => ({
    permissions: { ...initialPermissions },
    setPermissions: async (permissions) => {
        set({ permissions });
        const updates: Record<string, string> = {};
        Object.keys(permissions).forEach(key => {
            updates[`permission_${key}`] = permissions[key] ? 'true' : 'false';
        });
        try {
            await apiFetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error('Failed to sync permissions to DB:', err);
        }
    },
    resetPermissions: async () => {
        set({ permissions: { ...initialPermissions } });
        const updates: Record<string, string> = {};
        Object.keys(initialPermissions).forEach(key => {
            updates[`permission_${key}`] = initialPermissions[key] ? 'true' : 'false';
        });
        try {
            await apiFetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error('Failed to reset permissions on DB:', err);
        }
    },
    fetchPermissions: async () => {
        try {
            const res = await apiFetch(`${API_BASE}/settings`);
            if (res.ok) {
                const data = await res.json();
                const loadedPerms: Record<string, boolean> = {};
                let foundAny = false;
                Object.keys(data).forEach(key => {
                    if (key.startsWith('permission_')) {
                        const originalKey = key.substring('permission_'.length);
                        loadedPerms[originalKey] = data[key] === 'true';
                        foundAny = true;
                    }
                });
                if (foundAny) {
                    set({ permissions: { ...initialPermissions, ...loadedPerms } });
                    const guestVal = loadedPerms['Reworks__Add Low Priority__guest'];
                    if (guestVal !== undefined) {
                        useAppState.getState().setAllowGuestMinorRework(guestVal);
                    }
                }
                if (data.allowGuestMinorRework) {
                    useAppState.getState().setAllowGuestMinorRework(data.allowGuestMinorRework === 'true');
                }
                if (data.qrCodeUrlType === 'full' || data.qrCodeUrlType === 'compressed') {
                    useAppState.setState({ qrCodeUrlType: data.qrCodeUrlType });
                }
                if (data.qrCodeBaseUrlType === 'current' || data.qrCodeBaseUrlType === 'custom') {
                    useAppState.setState({ qrCodeBaseUrlType: data.qrCodeBaseUrlType });
                }
                if (typeof data.qrCodeCustomBaseUrl === 'string') {
                    useAppState.setState({ qrCodeCustomBaseUrl: data.qrCodeCustomBaseUrl });
                }
                if (data.qrCodeErrorCorrection === 'L' || data.qrCodeErrorCorrection === 'M' || data.qrCodeErrorCorrection === 'Q' || data.qrCodeErrorCorrection === 'H') {
                    useAppState.setState({ qrCodeErrorCorrection: data.qrCodeErrorCorrection });
                }
            }
        } catch (err) {
            console.error('Failed to fetch permissions from DB:', err);
        }
    }
}));
