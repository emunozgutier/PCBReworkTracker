import { useEffect, useRef } from 'react';
import { useAppState } from '../../store/useAppState';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { useReworkStore } from '../../store/clientDataBase/useReworkStore';
import { decodeBase36ShortCode } from './qrHelper';

const getNormalizedPath = () => {
    if (typeof window === 'undefined') return '/';
    let path = window.location.pathname;
    
    // Explicitly handle GitHub pages repository name masking, even in DEV mode (case-insensitive)
    const baseMatch = path.match(/^\/rework-tracker(\/|$)/i);
    if (baseMatch) {
        path = path.slice(baseMatch[0].length);
        if (!path.startsWith('/')) path = '/' + path;
    }
    
    let base = import.meta.env.BASE_URL || '/';
    if (base.endsWith('/')) base = base.slice(0, -1);
    if (path.startsWith(base)) {
        path = path.slice(base.length);
    }
    if (!path.startsWith('/')) path = '/' + path;
    console.log('[UrlManager] getNormalizedPath ->', { originalPath: window.location.pathname, base, path });
    return path;
};

export function UrlManager() {
    const { 
        activeTab, 
        expandedProject, 
        expandedPcb, 
        expandedRework, 
        isolatedView,
        page,
        selectedId,
        setActiveTab,
        setExpandedProject,
        setExpandedPcb,
        setExpandedRework,
        setIsolatedView
    } = useAppState();

    const pcbs = usePcbStore(state => state.pcbs);
    const loading = usePcbStore(state => state.loading);
    const hasFetched = usePcbStore(state => state.hasFetched);

    // 1. Listen to POPSTATE to sync URL -> Store
    useEffect(() => {
        const handlePopState = () => {
            const rawPath = getNormalizedPath();
            
            const lowerPath = rawPath.toLowerCase();

            // settings secrets page (DB settings)
            if (lowerPath === '/settings/secrets' || lowerPath === '/settings/secrets/') {
                useAppState.getState().setPage('settings_secrets');
                return;
            }

            // settings test page
            if (lowerPath === '/settings/test' || lowerPath === '/settings/test/' || lowerPath === '/projects/test' || lowerPath === '/projects/test/') {
                useAppState.getState().setPage('settings_test');
                return;
            }

            // settings qr print page
            if (lowerPath === '/settings/qr-print' || lowerPath === '/settings/qr-print/') {
                useAppState.getState().setPage('settings_qr_print');
                return;
            }

            // OTP Reset page
            if (lowerPath.startsWith('/reset-otp')) {
                useAppState.getState().setPage('reset_otp');
                return;
            }

            // Board Viewer page
            if (lowerPath.startsWith('/boardviewer/') || lowerPath.startsWith('/board-viewer/')) {
                const docId = rawPath.replace(/^\/(boardViewer|board-viewer)\//i, '');
                if (docId) {
                    useAppState.getState().editItem('board_viewer', docId);
                }
                return;
            }

            // Debug mode auto-enable via URL query or /debug path
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('debug') === 'true' || searchParams.get('debug') === '1') {
                useAppState.getState().setDebugMode(true);
                useAppState.getState().setDebugBypassPermissions(true);
            }

            if (lowerPath === '/debug' || lowerPath === '/debug/') {
                useAppState.getState().setDebugMode(true);
                useAppState.getState().setDebugBypassPermissions(true);
                useAppState.getState().setActiveTab('settings');
                return;
            }

            // ── Add pages direct routing ─────────────────────────────────────────
            if (lowerPath === '/projects/add' || lowerPath === '/projects/add/' || lowerPath === '/projects_add') {
                useAppState.getState().addItem('projects_add');
                return;
            }
            if (lowerPath === '/pcbs/add' || lowerPath === '/pcbs/add/' || lowerPath === '/pcbs_add') {
                useAppState.getState().addItem('pcbs_add');
                return;
            }
            if (lowerPath === '/reworks/add' || lowerPath === '/reworks/add/' || lowerPath === '/reworks_add') {
                useAppState.getState().addItem('reworks_add');
                return;
            }
            if (lowerPath === '/owners/add' || lowerPath === '/owners/add/' || lowerPath === '/owners_add') {
                useAppState.getState().addItem('owners_add');
                return;
            }
            if (lowerPath === '/tags/add' || lowerPath === '/tags/add/' || lowerPath === '/tags_add') {
                useAppState.getState().addItem('tags_add');
                return;
            }

            // ── Edit pages direct routing ────────────────────────────────────────
            const projEditMatch = lowerPath.match(/^\/projects\/([^\/]+)\/edit\/?$/);
            if (projEditMatch || lowerPath === '/projects/edit' || lowerPath === '/projects_edit') {
                const id = projEditMatch ? projEditMatch[1] : null;
                useAppState.getState().editItem('projects_edit', id || 1);
                return;
            }
            const pcbEditMatch = lowerPath.match(/^\/pcbs\/([^\/]+)\/edit\/?$/);
            if (pcbEditMatch || lowerPath === '/pcbs/edit' || lowerPath === '/pcbs_edit') {
                const id = pcbEditMatch ? pcbEditMatch[1] : null;
                useAppState.getState().editItem('pcbs_edit', id || 1);
                return;
            }
            const reworkEditMatch = lowerPath.match(/^\/reworks\/([^\/]+)\/edit\/?$/);
            if (reworkEditMatch || lowerPath === '/reworks/edit' || lowerPath === '/reworks_edit') {
                const id = reworkEditMatch ? reworkEditMatch[1] : null;
                useAppState.getState().editItem('reworks_edit', id || 1);
                return;
            }
            const ownerEditMatch = lowerPath.match(/^\/owners\/([^\/]+)\/edit\/?$/);
            if (ownerEditMatch || lowerPath === '/owners/edit' || lowerPath === '/owners_edit') {
                const id = ownerEditMatch ? ownerEditMatch[1] : null;
                useAppState.getState().editItem('owners_edit', id || 1);
                return;
            }
            const tagEditMatch = lowerPath.match(/^\/tags\/([^\/]+)\/edit\/?$/);
            if (tagEditMatch || lowerPath === '/tags/edit' || lowerPath === '/tags_edit') {
                const id = tagEditMatch ? tagEditMatch[1] : null;
                useAppState.getState().editItem('tags_edit', id || 1);
                return;
            }

            // Projects
            if (lowerPath.startsWith('/project/') || lowerPath.startsWith('/projects/')) {
                usePcbStore.getState().resetFilters();
                useReworkStore.getState().resetFilters();
                const name = decodeURIComponent(rawPath.replace(/^\/projects?\//i, ''));
                setActiveTab('projects');
                setExpandedProject(name || null);
                return;
            }
            // PCBs
            if (lowerPath.startsWith('/pcb/') || lowerPath.startsWith('/pcbs/')) {
                // Ignore matching /pcbs_add or /pcbs_edit forms by only matching base slash
                if (lowerPath.startsWith('/pcbs_')) return; 

                useReworkStore.getState().resetFilters();
                let board = decodeURIComponent(rawPath.replace(/^\/pcbs?\//i, ''));
                let isolated = false;
                if (board.toLowerCase().endsWith('/view')) {
                    board = board.replace(/\/[vV][iI][eE][wW]$/, '');
                    isolated = true;
                }
                setActiveTab('pcbs');
                setExpandedPcb(board || null);
                setIsolatedView(isolated);
                if (isolated && board) {
                    usePcbStore.getState().setSelectedBoardNumbers([board]);
                }
                return;
            }
            // Reworks
            if (lowerPath.startsWith('/rework/') || lowerPath.startsWith('/reworks/')) {
                 if (lowerPath.startsWith('/reworks_')) return; 

                 const id = decodeURIComponent(rawPath.replace(/^\/reworks?\//i, ''));
                 setActiveTab('reworks');
                 setExpandedRework(id || null);
                 return;
            }

            // Base Tabs
            // Use split to safely grab the first path segment regardless of leading/trailing slashes
            const pathSegments = rawPath.split('/').filter(Boolean);
            const path = pathSegments[0] ? pathSegments[0].toLowerCase() : 'projects';
            
            if (path === 'crc' || path === 'sandbox') {
                useAppState.getState().setActiveTab('settings');
                return;
            }
            
            const validPages = ['project', 'projects', 'pcb', 'pcbs', 'rework', 'reworks', 'owners', 'tags', 'settings'];
            
            if (validPages.includes(path)) {
                // Normalize singulars
                let tab = path;
                if (tab === 'project') tab = 'projects';
                if (tab === 'pcb') tab = 'pcbs';
                if (tab === 'rework') tab = 'reworks';

                if (tab !== 'pcbs') usePcbStore.getState().resetFilters();
                if (tab !== 'reworks') useReworkStore.getState().resetFilters();
                
                setActiveTab(tab);
                setExpandedProject(null);
                setExpandedPcb(null);
                setExpandedRework(null);
                return;
            }

            if (path.length >= 3 && path.length <= 10 && /^[A-Za-z0-9_-]{3,10}$/.test(path)) {
                useAppState.getState().setActiveTab('pcbs');
                useAppState.getState().setExpandedPcb(`SHORT:${path}`);
                useAppState.getState().setIsolatedView(true);
                return;
            }
        };

        // Run once on mount to handle initial load
        handlePopState();

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
        // We only want this to run on mount and popstate unmount, DO NOT add store dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isInitialMount = useRef(true);

    // 2. Listen to Store -> Push/Replace URL
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        let base = import.meta.env.BASE_URL || '/';
        if (base.endsWith('/')) base = base.slice(0, -1);
        
        // Handle board_viewer page URL mapping
        if (page === 'board_viewer' && selectedId) {
            const search = window.location.search;
            const targetUrl = `${base}/boardViewer/${selectedId}${search}`;
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== targetUrl) {
                window.history.pushState({}, '', targetUrl);
            }
            return;
        }

        if (page === 'settings_secrets') {
            const search = window.location.search;
            const targetUrl = `${base}/settings/secrets${search}`;
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== targetUrl) {
                window.history.pushState({}, '', targetUrl);
            }
            return;
        }

        if (page === 'settings_test') {
            const search = window.location.search;
            const isProjectsPath = window.location.pathname.includes('/projects/test');
            const targetUrl = `${base}/${isProjectsPath ? 'projects/test' : 'settings/test'}${search}`;
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== targetUrl) {
                window.history.pushState({}, '', targetUrl);
            }
            return;
        }

        if (page === 'settings_qr_print') {
            const search = window.location.search;
            const targetUrl = `${base}/settings/qr-print${search}`;
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== targetUrl) {
                window.history.pushState({}, '', targetUrl);
            }
            return;
        }

        if (page === 'reset_otp') {
            const search = window.location.search;
            const targetUrl = `${base}/reset-otp${search}`;
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== targetUrl) {
                window.history.pushState({}, '', targetUrl);
            }
            return;
        }

        if (page.endsWith('_add')) {
            const resource = page.replace('_add', '');
            const search = window.location.search;
            const targetUrl = `${base}/${resource}/add${search}`;
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== targetUrl) {
                window.history.pushState({}, '', targetUrl);
            }
            return;
        }

        if (page.endsWith('_edit')) {
            const resource = page.replace('_edit', '');
            const search = window.location.search;
            const idPart = selectedId ? `/${encodeURIComponent(String(selectedId))}` : '';
            const targetUrl = `${base}/${resource}${idPart}/edit${search}`;
            const currentPath = window.location.pathname + window.location.search;
            if (currentPath !== targetUrl) {
                window.history.pushState({}, '', targetUrl);
            }
            return;
        }

        let targetUrl = `${base}/${activeTab}`;
        if (activeTab === 'projects' && expandedProject) {
            targetUrl = `${base}/projects/${encodeURIComponent(expandedProject)}`;
        } else if (activeTab === 'pcbs' && expandedPcb) {
            // Check if user is navigating back to all boards in project view or an individual board
            const isViewOnly = isolatedView ? '/view' : '';
            targetUrl = `${base}/pcbs/${encodeURIComponent(expandedPcb)}${isViewOnly}`;
        } else if (activeTab === 'reworks' && expandedRework) {
            targetUrl = `${base}/reworks/${encodeURIComponent(expandedRework)}`;
        }

        const currentPath = window.location.pathname + window.location.search;
        console.log('[UrlManager] Before PushState ->', { activeTab, page, targetUrl, currentPath, base });
        if (currentPath !== targetUrl) {
            window.history.pushState({}, '', targetUrl);
        }
    }, [activeTab, expandedProject, expandedPcb, expandedRework, isolatedView, page, selectedId]);

    // 3. Strictly validate PCBs when data loads
    useEffect(() => {
        if (activeTab === 'pcbs' && expandedPcb && hasFetched && !loading) {
             if (expandedPcb.startsWith('SHORT:')) {
                 const rawCode = expandedPcb.slice(6);
                 const code = rawCode.toUpperCase();
                 
                 // 1. Direct match by pcb.short_code
                 let pcb = pcbs.find(p => p.short_code && p.short_code.toUpperCase() === code);
                 
                 // 2. Base36 decoding match: decode project key and board number
                 if (!pcb) {
                     const decoded = decodeBase36ShortCode(code);
                     if (decoded) {
                         pcb = pcbs.find(p => {
                             const pKey = ((p as any).project_key || (p.project || '').slice(0, 3)).toUpperCase();
                             if (pKey !== decoded.projectKey) return false;
                             
                             const matches = (p.board_number || '').match(/\d+/g);
                             if (matches && matches.length > 0) {
                                 const bNum = parseInt(matches[matches.length - 1], 10);
                                 return bNum === decoded.boardNumber;
                             }
                             return false;
                         });
                     }
                 }

                 // 3. Flexible match: match clean project + number (e.g. DIO16, DIO0016, or DIO01)
                 if (!pcb) {
                     pcb = pcbs.find(p => {
                         const cleanBoard = (p.board_number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                         if (cleanBoard === code) return true;
                         if (cleanBoard.slice(0, -1) === code) return true; // without checksum letter
                         
                         const boardMatch = cleanBoard.match(/^([A-Z]+)0*(\d+)[A-Z]?$/);
                         const codeMatch = code.match(/^([A-Z]+)0*(\d+)$/);
                         if (boardMatch && codeMatch && boardMatch[1] === codeMatch[1] && boardMatch[2] === codeMatch[2]) {
                             return true;
                         }
                         return false;
                     });
                 }
                 if (pcb) {
                     useAppState.getState().setPage('pcbs');
                     useAppState.getState().setExpandedPcb(pcb.board_number);
                     useAppState.getState().setIsolatedView(true);
                     usePcbStore.getState().setSelectedBoardNumbers([pcb.board_number]);
                 } else {
                     useAppState.getState().setPage('wrong_url');
                 }
                 return;
             }
             
             const pcb = pcbs.find(p => 
                 p.board_number === expandedPcb || 
                 p.board_number.toLowerCase() === expandedPcb.toLowerCase() ||
                 (p.short_code && p.short_code.toUpperCase() === expandedPcb.toUpperCase())
             );
             if (!pcb) {
                 useAppState.getState().setPage('wrong_url');
             } else {
                 useAppState.getState().setPage('pcbs');
                 if (expandedPcb !== pcb.board_number) {
                     useAppState.getState().setExpandedPcb(pcb.board_number);
                 }
                 if (isolatedView) {
                     usePcbStore.getState().setSelectedBoardNumbers([pcb.board_number]);
                 }
             }
        }
    }, [activeTab, expandedPcb, pcbs, loading, hasFetched, isolatedView]);

    return null;
}
