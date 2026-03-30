import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { usePcbStore } from '../../store/storePcb';
import { useReworkStore } from '../../store/storeRework';
import { findClosestBoard } from './crc';

const getNormalizedPath = () => {
    if (typeof window === 'undefined') return '/';
    let path = window.location.pathname;
    let base = import.meta.env.BASE_URL || '/';
    if (base.endsWith('/')) base = base.slice(0, -1);
    if (path.startsWith(base)) {
        path = path.slice(base.length);
    }
    if (!path.startsWith('/')) path = '/' + path;
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
        setActiveTab,
        setExpandedProject,
        setExpandedPcb,
        setExpandedRework,
        setIsolatedView
    } = useStore();

    const pcbs = usePcbStore(state => state.pcbs);

    // 1. Listen to POPSTATE to sync URL -> Store
    useEffect(() => {
        const handlePopState = () => {
            const rawPath = getNormalizedPath();
            
            // Projects
            if (rawPath.startsWith('/project/') || rawPath.startsWith('/projects/')) {
                usePcbStore.getState().resetFilters();
                useReworkStore.getState().resetFilters();
                const name = decodeURIComponent(rawPath.replace(/^\/projects?\//, ''));
                setActiveTab('projects');
                setExpandedProject(name || null);
                return;
            }
            // PCBs
            if (rawPath.startsWith('/pcb/') || rawPath.startsWith('/pcbs/')) {
                // Ignore matching /pcbs_add or /pcbs_edit forms by only matching base slash
                if (rawPath.startsWith('/pcbs_')) return; 

                useReworkStore.getState().resetFilters();
                let board = decodeURIComponent(rawPath.replace(/^\/pcbs?\//, ''));
                let isolated = false;
                if (board.endsWith('/view')) {
                    board = board.replace('/view', '');
                    isolated = true;
                }
                setActiveTab('pcbs');
                setExpandedPcb(board || null);
                setIsolatedView(isolated);
                return;
            }
            // Reworks
            if (rawPath.startsWith('/rework/') || rawPath.startsWith('/reworks/')) {
                 if (rawPath.startsWith('/reworks_')) return; 

                 const id = decodeURIComponent(rawPath.replace(/^\/reworks?\//, ''));
                 setActiveTab('reworks');
                 setExpandedRework(id || null);
                 return;
            }

            // Base Tabs
            const path = rawPath.replace('/', '') || 'projects';
            
            if (path === 'test') {
                useStore.getState().setPage('test_typo');
                return;
            }
            
            const validPages = ['project', 'projects', 'pcb', 'pcbs', 'rework', 'reworks', 'owners', 'tags'];
            
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
            }
        };

        // Run once on mount to handle initial load
        handlePopState();

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
        // We only want this to run on mount and popstate unmount, DO NOT add store dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Listen to Store -> Push/Replace URL
    useEffect(() => {
        let base = import.meta.env.BASE_URL || '/';
        if (base.endsWith('/')) base = base.slice(0, -1);
        
        // Don't push state if we are inside a form view
        if (page !== activeTab && page.includes('_')) return;

        let targetUrl = `${base}/${activeTab}`;
        
        if (page === 'test_typo') {
            targetUrl = `${base}/test`;
        } else if (activeTab === 'projects' && expandedProject) {
            targetUrl = `${base}/projects/${encodeURIComponent(expandedProject)}`;
        } else if (activeTab === 'pcbs' && expandedPcb) {
            targetUrl = `${base}/pcbs/${encodeURIComponent(expandedPcb)}${isolatedView ? '/view' : ''}`;
        } else if (activeTab === 'reworks' && expandedRework) {
            targetUrl = `${base}/reworks/${encodeURIComponent(expandedRework)}`;
        }

        // Only push if the resulting URL is different from the current to avoid infinite loops
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== targetUrl) {
            window.history.pushState({}, '', targetUrl);
        }
    }, [activeTab, expandedProject, expandedPcb, expandedRework, isolatedView, page]);

    // 3. Auto-correct mistyped PCBs using CRC when data loads
    useEffect(() => {
        if (activeTab === 'pcbs' && expandedPcb && pcbs.length > 0) {
             const match = findClosestBoard(expandedPcb, pcbs);
             if (match && match !== expandedPcb) {
                 const store = useStore.getState();
                 store.setMistypedUrl(expandedPcb);
                 store.setCorrectedUrl(match);
                 store.setPage('fixed_url');
             } else if (!match) {
                 useStore.getState().setPage('wrong_url');
             }
        }
    }, [activeTab, expandedPcb, pcbs]);

    return null;
}
