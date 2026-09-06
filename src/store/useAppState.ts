import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePcbStore } from './clientDataBase/usePcbStore';
import { useReworkStore } from './clientDataBase/useReworkStore';
import { useTagStore } from './clientDataBase/useTagStore';
import { apiFetch, API_BASE } from './serverDataBase/apiBridge';
import { getSessionCookie, clearSessionCookie } from '../authentication/clientAuth';

type Page = 
    | 'projects' | 'projects_add' | 'projects_edit'
    | 'pcbs' | 'pcbs_add' | 'pcbs_edit'
    | 'reworks' | 'reworks_add' | 'reworks_edit'
    | 'owners' | 'owners_add' | 'owners_edit'
    | 'tags' | 'tags_add' | 'tags_edit'
    | 'wrong_url' | 'fixed_url'
    | 'sandbox' | 'settings' | 'settings_test' | 'settings_secrets' | 'settings_qr_print' | 'reset_otp' | 'board_viewer' | 'doc_viewer';

interface NavigationState {
    page: Page;
    activeTab: string;
    selectedId: string | number | null;
    isMobile: boolean;
    expandedProject: string | null;
    expandedPcb: string | null;
    expandedRework: string | null;
    isolatedView: boolean;
    qrModalBoard: string | null;
    mistypedUrl: string | null;
    correctedUrl: string | null;
    
    // Search and filter states for top header buttons
    searchQuery: string;
    showFilters: boolean;
    showMobileSearch: boolean;
    
    // Actions
    setPage: (page: Page) => void;
    setActiveTab: (tab: string) => void;
    editItem: (page: Page, id: string | number) => void;
    addItem: (page: Page, prefillId?: string | number) => void;
    goBack: () => void;
    setIsMobile: (isMobile: boolean) => void;
    setExpandedProject: (name: string | null) => void;
    setExpandedPcb: (name: string | null) => void;
    setExpandedRework: (id: string | null) => void;
    setIsolatedView: (isolatedView: boolean) => void;
    setQrModalBoard: (board: string | null) => void;
    setMistypedUrl: (url: string | null) => void;
    setCorrectedUrl: (url: string | null) => void;
    setSearchQuery: (query: string) => void;
    setShowFilters: (show: boolean) => void;
    setShowMobileSearch: (show: boolean) => void;
    
    // Auth & Permissions
    currentUser: any | null;
    currentUserRole: 'Super User' | 'User' | 'Guest';
    setCurrentUser: (user: any | null, role: 'Super User' | 'User' | 'Guest') => void;

    // Global Settings merged
    crcFormat: 'letter' | 'nato';
    allowGuestMinorRework: boolean;
    qrCodeUrlType: 'full' | 'compressed';
    qrCodeBaseUrlType: 'current' | 'custom';
    qrCodeCustomBaseUrl: string;
    qrCodeErrorCorrection: 'L' | 'M' | 'Q' | 'H';
    qrCodeMode: 'byte' | 'alphanumeric';
    setCrcFormat: (crcFormat: 'letter' | 'nato') => void;
    toggleCrcFormat: () => void;
    setAllowGuestMinorRework: (allowed: boolean) => void;
    setQrCodeUrlType: (type: 'full' | 'compressed') => void;
    setQrCodeBaseUrlType: (type: 'current' | 'custom') => void;
    setQrCodeCustomBaseUrl: (url: string) => void;
    setQrCodeErrorCorrection: (level: 'L' | 'M' | 'Q' | 'H') => void;
    setQrCodeMode: (mode: 'byte' | 'alphanumeric') => void;
    // Debug & AI Tools
    debugMode: boolean;
    debugBypassPermissions: boolean;
    setDebugMode: (enabled: boolean) => void;
    setDebugBypassPermissions: (bypass: boolean) => void;
    setRoleQuick: (role: 'Super User' | 'User' | 'Guest') => void;
    resetSettings: () => void;
}

// Initial default auth values
let initialUser = null;
let initialRole: 'Super User' | 'User' | 'Guest' = 'Guest';

function getInitialDebugMode(): boolean {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('debug') === 'true' || params.get('debug') === '1') return true;
        if (window.location.pathname.toLowerCase().includes('/debug')) return true;
        try {
            return localStorage.getItem('pcb_debug_mode') === 'true';
        } catch {}
    }
    return false;
}

function getInitialCrcFormat(): 'letter' | 'nato' {
    if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        if (hash.includes('nato')) return 'nato';
        if (hash.includes('letter')) return 'letter';
        
        const params = new URLSearchParams(window.location.search);
        if (params.get('crc') === 'nato') return 'nato';
        if (params.get('crc') === 'letter') return 'letter';
    }
    return 'letter';
}

export const useAppState = create<NavigationState>()(
    persist(
        (set, get) => ({
            page: 'projects',
            activeTab: 'projects',
            selectedId: null,
            isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
            expandedProject: null,
            expandedPcb: null,
            expandedRework: null,
            isolatedView: false,
            qrModalBoard: null,
            mistypedUrl: null,
            correctedUrl: null,
            searchQuery: '',
            showFilters: false,
            showMobileSearch: false,
            currentUser: initialUser,
            currentUserRole: initialRole,

            // Debug & AI Tools
            debugMode: getInitialDebugMode(),
            debugBypassPermissions: getInitialDebugMode(),
            setDebugMode: (debugMode) => {
                set({ debugMode });
                if (typeof window !== 'undefined') {
                    try { localStorage.setItem('pcb_debug_mode', String(debugMode)); } catch {}
                }
            },
            setDebugBypassPermissions: (debugBypassPermissions) => set({ debugBypassPermissions }),
            setRoleQuick: (role) => {
                set({ currentUserRole: role });
            },

            // Global Settings
            crcFormat: getInitialCrcFormat(),
            allowGuestMinorRework: true,
            qrCodeUrlType: 'full',
            qrCodeBaseUrlType: 'current',
            qrCodeCustomBaseUrl: '',
            qrCodeErrorCorrection: 'L',
            qrCodeMode: 'byte',

            setQrCodeUrlType: (qrCodeUrlType) => {
                set({ qrCodeUrlType });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qrCodeUrlType })
                }).catch(err => {
                    console.error('Failed to save qrCodeUrlType to DB:', err);
                });
            },

            setQrCodeBaseUrlType: (qrCodeBaseUrlType) => {
                set({ qrCodeBaseUrlType });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qrCodeBaseUrlType })
                }).catch(err => {
                    console.error('Failed to save qrCodeBaseUrlType to DB:', err);
                });
            },

            setQrCodeCustomBaseUrl: (qrCodeCustomBaseUrl) => {
                set({ qrCodeCustomBaseUrl });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qrCodeCustomBaseUrl })
                }).catch(err => {
                    console.error('Failed to save qrCodeCustomBaseUrl to DB:', err);
                });
            },

            setQrCodeErrorCorrection: (qrCodeErrorCorrection) => {
                set({ qrCodeErrorCorrection });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qrCodeErrorCorrection })
                }).catch(err => {
                    console.error('Failed to save qrCodeErrorCorrection to DB:', err);
                });
            },

            setQrCodeMode: (qrCodeMode) => {
                set({ qrCodeMode });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qrCodeMode })
                }).catch(err => {
                    console.error('Failed to save qrCodeMode to DB:', err);
                });
            },

            setCrcFormat: (crcFormat) => {
                set({ crcFormat });

                // If logged in user changes setting, save to database
                const { currentUser, currentUserRole } = get();
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
                            get().setCurrentUser(updatedUser, currentUserRole);
                        }
                    }).catch(err => {
                        console.error('Failed to sync crc_format setting to DB:', err);
                    });
                }
            },

            toggleCrcFormat: () => {
                const nextFormat = get().crcFormat === 'letter' ? 'nato' : 'letter';
                get().setCrcFormat(nextFormat);
            },

            setAllowGuestMinorRework: (allowGuestMinorRework) => {
                set({ allowGuestMinorRework });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ allowGuestMinorRework: allowGuestMinorRework ? 'true' : 'false' })
                }).catch(err => {
                    console.error('Failed to save allowGuestMinorRework to DB:', err);
                });
            },

            resetSettings: () => {
                set({
                    crcFormat: getInitialCrcFormat(),
                    allowGuestMinorRework: true,
                    qrCodeUrlType: 'full',
                    qrCodeBaseUrlType: 'current',
                    qrCodeCustomBaseUrl: '',
                    qrCodeErrorCorrection: 'L',
                    qrCodeMode: 'byte'
                });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        crcFormat: getInitialCrcFormat(),
                        allowGuestMinorRework: 'true',
                        qrCodeUrlType: 'full',
                        qrCodeBaseUrlType: 'current',
                        qrCodeCustomBaseUrl: '',
                        qrCodeErrorCorrection: 'L',
                        qrCodeMode: 'byte'
                    })
                }).catch(err => {
                    console.error('Failed to reset DB settings:', err);
                });
            },

            setCurrentUser: (currentUser, currentUserRole) => {
                set({ currentUser, currentUserRole });
                if (currentUser && currentUser.crc_format) {
                    set({ crcFormat: currentUser.crc_format });
                } else if (!currentUser) {
                    set({ crcFormat: 'letter' });
                }
                if (typeof window !== 'undefined') {
                    if (currentUserRole === 'Guest') {
                        clearSessionCookie();
                    }
                }
            },
            setPage: (page) => set({ page }),
            setIsolatedView: (isolatedView) => set({ isolatedView }),
            
            setExpandedProject: (name) => {
                set({ expandedProject: name });
            },

            setExpandedPcb: (name) => {
                set({ expandedPcb: name });
            },

            setExpandedRework: (id) => {
                set({ expandedRework: id });
            },

            setQrModalBoard: (name) => set({ qrModalBoard: name }),
            setMistypedUrl: (url) => set({ mistypedUrl: url }),
            setCorrectedUrl: (url) => set({ correctedUrl: url }),
            setSearchQuery: (searchQuery) => set({ searchQuery }),
            setShowFilters: (showFilters) => set({ showFilters }),
            setShowMobileSearch: (showMobileSearch) => set({ showMobileSearch }),

            setActiveTab: (tab) => {
                usePcbStore.getState().resetFilters();
                useReworkStore.getState().resetFilters();
                useTagStore.getState().resetFilters();

                set({ 
                    activeTab: tab, 
                    page: tab as Page, // When we switch tabs, we go to the main list page
                    selectedId: null,
                    expandedProject: null,
                    expandedPcb: null,
                    expandedRework: null,
                    isolatedView: false,
                    searchQuery: '',
                    showFilters: false,
                    showMobileSearch: false
                });
            },

            editItem: (page, id) => set({ 
                page, 
                selectedId: id 
            }),

            addItem: (page, prefillId) => {
                const baseTab = page.split('_')[0];
                if (typeof window !== 'undefined' && get().activeTab !== baseTab) {
                    set({ 
                        activeTab: baseTab,
                        page, 
                        selectedId: prefillId || null 
                    });
                    return;
                }
                set({ 
                    page, 
                    selectedId: prefillId || null 
                });
            },

            goBack: () => set((state) => ({ 
                page: state.activeTab as Page, 
                selectedId: null 
            })),

            setIsMobile: (isMobile) => set({ isMobile }),
        }),
        {
            name: 'pcb-rework-tracker-global-settings',
            partialize: (state) => ({
                crcFormat: state.crcFormat,
                allowGuestMinorRework: state.allowGuestMinorRework,
                qrCodeUrlType: state.qrCodeUrlType,
                qrCodeBaseUrlType: state.qrCodeBaseUrlType,
                qrCodeCustomBaseUrl: state.qrCodeCustomBaseUrl,
                qrCodeErrorCorrection: state.qrCodeErrorCorrection,
                qrCodeMode: state.qrCodeMode,
                currentUser: state.currentUser,
                currentUserRole: state.currentUserRole,
                debugMode: state.debugMode,
                debugBypassPermissions: state.debugBypassPermissions
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    const hasSessionCookie = getSessionCookie();
                    if (!hasSessionCookie && state.currentUserRole !== 'Guest') {
                        state.setCurrentUser(null, 'Guest');
                    }
                }
            },
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

// Initialize listener
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        const mobile = window.innerWidth <= 768;
        if (useAppState.getState().isMobile !== mobile) {
            useAppState.getState().setIsMobile(mobile);
        }
    });
}
