import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePcbStore } from './localDataBaseCopy/usePcbStore';
import { useReworkStore } from './localDataBaseCopy/useReworkStore';
import { useTagStore } from './localDataBaseCopy/useTagStore';
import { apiFetch, API_BASE } from './database/apiBridge';

type Page = 
    | 'projects' | 'projects_add' | 'projects_edit'
    | 'pcbs' | 'pcbs_add' | 'pcbs_edit'
    | 'reworks' | 'reworks_add' | 'reworks_edit'
    | 'owners' | 'owners_add' | 'owners_edit'
    | 'tags' | 'tags_add' | 'tags_edit'
    | 'wrong_url' | 'fixed_url'
    | 'sandbox' | 'settings' | 'settings_test' | 'reset_otp';

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
    setCrcFormat: (crcFormat: 'letter' | 'nato') => void;
    toggleCrcFormat: () => void;
    setAllowGuestMinorRework: (allowed: boolean) => void;
    resetSettings: () => void;
}

// Load initial session from localStorage if valid
let initialUser = null;
let initialRole: 'Super User' | 'User' | 'Guest' = 'Guest';

if (typeof window !== 'undefined') {
    try {
        const storedUser = localStorage.getItem('rework_user');
        const storedRole = localStorage.getItem('rework_role');
        const storedExpires = localStorage.getItem('rework_session_expires');

        if (storedUser && storedRole && storedExpires) {
            const expires = parseInt(storedExpires, 10);
            if (Date.now() < expires) {
                initialUser = JSON.parse(storedUser);
                initialRole = storedRole as 'Super User' | 'User' | 'Guest';
            } else {
                localStorage.removeItem('rework_user');
                localStorage.removeItem('rework_role');
                localStorage.removeItem('rework_session_expires');
            }
        }
    } catch (e) {
        console.error('Failed to load session from localStorage', e);
    }
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

            // Global Settings
            crcFormat: getInitialCrcFormat(),
            allowGuestMinorRework: true,

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

                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ crcFormat })
                }).catch(err => {
                    console.error('Failed to save crcFormat to DB settings:', err);
                });
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
                    allowGuestMinorRework: true
                });
                apiFetch(`${API_BASE}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        crcFormat: getInitialCrcFormat(),
                        allowGuestMinorRework: 'true'
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
                    try {
                        if (currentUserRole === 'Guest') {
                            localStorage.removeItem('rework_user');
                            localStorage.removeItem('rework_role');
                            localStorage.removeItem('rework_session_expires');
                        } else {
                            localStorage.setItem('rework_user', JSON.stringify(currentUser));
                            localStorage.setItem('rework_role', currentUserRole);
                            const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 week
                            localStorage.setItem('rework_session_expires', expires.toString());
                        }
                    } catch (e) {
                        console.error('Failed to save session to localStorage', e);
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
                allowGuestMinorRework: state.allowGuestMinorRework
            }),
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
