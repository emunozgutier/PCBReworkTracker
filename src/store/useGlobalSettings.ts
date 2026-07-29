import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiFetch, API_BASE } from './database/apiBridge';
import { useAppState } from './useAppState';

export type CrcFormatOption = 'letter' | 'nato';

export interface GlobalSettingsProperties {
    crcFormat: CrcFormatOption;
    allowGuestMinorRework: boolean;
}

export interface GlobalSettingsActions {
    setCrcFormat: (crcFormat: CrcFormatOption) => void;
    toggleCrcFormat: () => void;
    setAllowGuestMinorRework: (allowed: boolean) => void;
    resetSettings: () => void;
}

export type GlobalSettingsState = GlobalSettingsProperties & GlobalSettingsActions;

// Try to parse initial crc_format from stored session if present
const getInitialCrcFormat = (): CrcFormatOption => {
    if (typeof window !== 'undefined') {
        try {
            const storedUser = localStorage.getItem('rework_user');
            const storedExpires = localStorage.getItem('rework_session_expires');
            if (storedUser && storedExpires) {
                const expires = parseInt(storedExpires, 10);
                if (Date.now() < expires) {
                    const user = JSON.parse(storedUser);
                    if (user && user.crc_format) {
                        return user.crc_format as CrcFormatOption;
                    }
                }
            }
        } catch (e) {}
    }
    return 'letter';
};

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettingsProperties = {
    crcFormat: getInitialCrcFormat(),
    allowGuestMinorRework: true,
};

export const useGlobalSettings = create<GlobalSettingsState>()(
    persist(
        (set) => ({
            ...DEFAULT_GLOBAL_SETTINGS,

            setCrcFormat: (crcFormat) => {
                set({ crcFormat });

                // If logged in user changes setting, save to database
                const { currentUser, currentUserRole } = useAppState.getState();
                if (currentUser && currentUserRole !== 'Guest') {
                    apiFetch(`${API_BASE}/owners/${currentUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: currentUser.name,
                            username: currentUser.username,
                            email: currentUser.email,
                            crc_format: crcFormat
                        })
                    }).then(res => {
                        if (res.ok) {
                            const updatedUser = { ...currentUser, crc_format: crcFormat };
                            useAppState.getState().setCurrentUser(updatedUser, currentUserRole);
                        }
                    }).catch(err => {
                        console.error('Failed to sync crc_format setting to DB:', err);
                    });
                }
            },

            toggleCrcFormat: () => {
                const nextFormat = useGlobalSettings.getState().crcFormat === 'letter' ? 'nato' : 'letter';
                useGlobalSettings.getState().setCrcFormat(nextFormat);
            },

            setAllowGuestMinorRework: (allowGuestMinorRework) => {
                set({ allowGuestMinorRework });
            },

            resetSettings: () => set(DEFAULT_GLOBAL_SETTINGS),
        }),
        {
            name: 'pcb-rework-tracker-global-settings',
            storage: createJSONStorage(() => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    return window.localStorage;
                }
                // Fallback dummy storage for Node / test environments
                return {
                    getItem: () => null,
                    setItem: () => {},
                    removeItem: () => {},
                };
            }),
        }
    )
);

// Subscribe to app session changes to update crcFormat setting dynamically
if (typeof window !== 'undefined') {
    let lastUserId = null;
    useAppState.subscribe((state) => {
        const user = state.currentUser;
        const userId = user ? user.id : null;
        if (userId !== lastUserId) {
            lastUserId = userId;
            if (user && user.crc_format) {
                // Update settings without triggering database save cycle
                useGlobalSettings.setState({ crcFormat: user.crc_format });
            } else if (!user) {
                // Revert settings to guest defaults on logout
                useGlobalSettings.setState({ crcFormat: 'letter' });
            }
        }
    });
}
