import { useState, useEffect } from 'react';
import { 
    Terminal, 
    X, 
    ShieldAlert, 
    ShieldCheck, 
    PlusCircle, 
    Edit3, 
    Trash2, 
    Eye, 
    KeyRound, 
    ChevronDown, 
    ChevronUp,
    Sparkles,
    SlidersHorizontal
} from 'lucide-react';
import { useAppState } from '../../store/useAppState';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { useReworkStore } from '../../store/clientDataBase/useReworkStore';
import { useOwnerStore } from '../../store/clientDataBase/useOwnerStore';
import { useTagStore } from '../../store/clientDataBase/useTagStore';

import { RemoveProject } from '../../Pages/RemovePage/RemoveProject';
import { RemovePcb } from '../../Pages/RemovePage/RemovePcb';
import { RemoveRework } from '../../Pages/RemovePage/RemoveRework';
import { RemoveTag } from '../../Pages/RemovePage/RemoveTag';

import './DebugHub.css';

export function DebugHub() {
    const { 
        page, 
        activeTab, 
        selectedId, 
        currentUserRole, 
        debugBypassPermissions, 
        setDebugMode, 
        setDebugBypassPermissions, 
        setRoleQuick, 
        addItem, 
        editItem, 
        setActiveTab,
        setPage
    } = useAppState();

    const [isOpen, setIsOpen] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        roles: false,
        add: false,
        edit: false,
        remove: false,
        viewers: true,
        info: true
    });

    // States for interactive delete dialog previews
    const [previewModal, setPreviewModal] = useState<'project' | 'pcb' | 'rework' | 'tag' | null>(null);

    const projects = useProjectStore(state => state.projects);
    const pcbs = usePcbStore(state => state.pcbs);
    const reworks = useReworkStore(state => state.reworks);
    const owners = useOwnerStore(state => state.owners);
    const tags = useTagStore(state => state.tags);

    // Keyboard shortcut to open/close (Alt+D or Ctrl+Shift+D)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.altKey && (e.key === 'd' || e.key === 'D')) || 
                (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D'))) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleSection = (section: string) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Prepare mock/real items for delete previews
    const sampleProject = projects[0] || { id: 1, name: 'Sample-Project-Alpha', project_key: 'SPA' };
    const samplePcb = pcbs[0] || { id: 1, board_number: 'SPA-0001-A', project: sampleProject.name, number_format: 'decimal' };
    const sampleRework = reworks[0] || { id: 1, board_number: samplePcb.board_number, description: 'Replaced R14 10k resistor' };
    const sampleTag = tags[0] || { id: 1, name: 'High-Temperature', color: '#f97316' };

    const firstProjectId = projects[0]?.id || 1;
    const firstPcbId = pcbs[0]?.id || 1;
    const firstReworkId = reworks[0]?.id || 1;
    const firstOwnerId = owners[0]?.id || 1;
    const firstTagId = tags[0]?.id || 1;

    return (
        <>
            {/* Floating Trigger Button */}
            <div className="debug-hub-trigger-container">
                <button 
                    className={`debug-hub-trigger ${debugBypassPermissions ? 'bypass-active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    title="Developer & AI Debug Hub (Shortcut: Alt+D)"
                >
                    <Terminal size={16} />
                    <span>Debug Hub</span>
                    {debugBypassPermissions && (
                        <span className="debug-hub-badge-dot" title="Permissions Bypass Active" />
                    )}
                </button>
            </div>

            {/* Slide-out / Floating Debug Hub Modal Panel */}
            {isOpen && (
                <div className="debug-hub-panel-overlay" onClick={() => setIsOpen(false)}>
                    <div className="debug-hub-panel" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="debug-hub-header">
                            <div className="debug-hub-title-group">
                                <div className="debug-hub-icon-wrap">
                                    <Sparkles size={16} color="var(--accent)" />
                                </div>
                                <div>
                                    <h3 className="debug-hub-title">Developer & AI Debug Hub</h3>
                                    <span className="debug-hub-subtitle">Inspect any Add, Edit, or Delete view as Guest</span>
                                </div>
                            </div>
                            <button className="debug-hub-close-btn" onClick={() => setIsOpen(false)} title="Close Debug Hub (Alt+D)">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="debug-hub-body">

                            {/* Permission Bypass Toggle Card */}
                            <div className={`debug-hub-toggle-card ${debugBypassPermissions ? 'active' : ''}`}>
                                <div className="debug-hub-toggle-info">
                                    <div className="debug-hub-toggle-title">
                                        {debugBypassPermissions ? <ShieldCheck size={18} color="#22c55e" /> : <ShieldAlert size={18} color="#f59e0b" />}
                                        <span>Bypass UI Permissions</span>
                                    </div>
                                    <p className="debug-hub-toggle-desc">
                                        Allows Guests to view, render, and interact with all Add pages, Edit forms, and Delete dialogs without "Access Denied".
                                    </p>
                                </div>
                                <label className="debug-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={debugBypassPermissions}
                                        onChange={(e) => {
                                            setDebugBypassPermissions(e.target.checked);
                                            setDebugMode(e.target.checked);
                                        }}
                                    />
                                    <span className="debug-slider round"></span>
                                </label>
                            </div>

                            {/* Section: Quick Role Switcher */}
                            <div className="debug-hub-section">
                                <div className="debug-hub-section-header" onClick={() => toggleSection('roles')}>
                                    <div className="debug-hub-section-title">
                                        <KeyRound size={14} />
                                        <span>Instant Role Switcher</span>
                                        <span className="debug-hub-current-role-pill">{currentUserRole}</span>
                                    </div>
                                    {collapsedSections.roles ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </div>
                                {!collapsedSections.roles && (
                                    <div className="debug-hub-role-buttons">
                                        <button 
                                            className={`debug-role-btn ${currentUserRole === 'Guest' ? 'selected' : ''}`}
                                            onClick={() => setRoleQuick('Guest')}
                                        >
                                            Guest
                                        </button>
                                        <button 
                                            className={`debug-role-btn user ${currentUserRole === 'User' ? 'selected' : ''}`}
                                            onClick={() => setRoleQuick('User')}
                                        >
                                            User
                                        </button>
                                        <button 
                                            className={`debug-role-btn super ${currentUserRole === 'Super User' ? 'selected' : ''}`}
                                            onClick={() => setRoleQuick('Super User')}
                                        >
                                            Super User
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section: Add Pages Navigation */}
                            <div className="debug-hub-section">
                                <div className="debug-hub-section-header" onClick={() => toggleSection('add')}>
                                    <div className="debug-hub-section-title">
                                        <PlusCircle size={14} color="#38bdf8" />
                                        <span>Add Pages</span>
                                    </div>
                                    {collapsedSections.add ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </div>
                                {!collapsedSections.add && (
                                    <div className="debug-hub-grid">
                                        <button className="debug-nav-item" onClick={() => { addItem('projects_add'); setIsOpen(false); }}>
                                            <span className="dot add-dot" /> Add Project
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { addItem('pcbs_add'); setIsOpen(false); }}>
                                            <span className="dot add-dot" /> Add PCB
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { addItem('reworks_add'); setIsOpen(false); }}>
                                            <span className="dot add-dot" /> Add Rework
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { addItem('owners_add'); setIsOpen(false); }}>
                                            <span className="dot add-dot" /> Add Owner
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { addItem('tags_add'); setIsOpen(false); }}>
                                            <span className="dot add-dot" /> Add Tag
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section: Edit Pages Navigation */}
                            <div className="debug-hub-section">
                                <div className="debug-hub-section-header" onClick={() => toggleSection('edit')}>
                                    <div className="debug-hub-section-title">
                                        <Edit3 size={14} color="#a855f7" />
                                        <span>Edit Pages</span>
                                    </div>
                                    {collapsedSections.edit ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </div>
                                {!collapsedSections.edit && (
                                    <div className="debug-hub-grid">
                                        <button className="debug-nav-item" onClick={() => { editItem('projects_edit', firstProjectId); setIsOpen(false); }}>
                                            <span className="dot edit-dot" /> Edit Project
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { editItem('pcbs_edit', firstPcbId); setIsOpen(false); }}>
                                            <span className="dot edit-dot" /> Edit PCB
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { editItem('reworks_edit', firstReworkId); setIsOpen(false); }}>
                                            <span className="dot edit-dot" /> Edit Rework
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { editItem('owners_edit', firstOwnerId); setIsOpen(false); }}>
                                            <span className="dot edit-dot" /> Edit Owner
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { editItem('tags_edit', firstTagId); setIsOpen(false); }}>
                                            <span className="dot edit-dot" /> Edit Tag
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section: Delete / Remove Dialog Previews */}
                            <div className="debug-hub-section">
                                <div className="debug-hub-section-header" onClick={() => toggleSection('remove')}>
                                    <div className="debug-hub-section-title">
                                        <Trash2 size={14} color="#ef4444" />
                                        <span>Delete / Remove Dialogs</span>
                                    </div>
                                    {collapsedSections.remove ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </div>
                                {!collapsedSections.remove && (
                                    <div className="debug-hub-grid">
                                        <button className="debug-nav-item danger" onClick={() => setPreviewModal('project')}>
                                            <span className="dot danger-dot" /> Remove Project Modal
                                        </button>
                                        <button className="debug-nav-item danger" onClick={() => setPreviewModal('pcb')}>
                                            <span className="dot danger-dot" /> Remove PCB Modal
                                        </button>
                                        <button className="debug-nav-item danger" onClick={() => setPreviewModal('rework')}>
                                            <span className="dot danger-dot" /> Remove Rework Modal
                                        </button>
                                        <button className="debug-nav-item danger" onClick={() => setPreviewModal('tag')}>
                                            <span className="dot danger-dot" /> Remove Tag Modal
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section: Viewers & Utility Pages */}
                            <div className="debug-hub-section">
                                <div className="debug-hub-section-header" onClick={() => toggleSection('viewers')}>
                                    <div className="debug-hub-section-title">
                                        <Eye size={14} color="#10b981" />
                                        <span>Viewers & Utility Pages</span>
                                    </div>
                                    {collapsedSections.viewers ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </div>
                                {!collapsedSections.viewers && (
                                    <div className="debug-hub-grid">
                                        <button className="debug-nav-item" onClick={() => { setPage('settings_qr_print'); setIsOpen(false); }}>
                                            QR Print Studio
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { setPage('settings_test'); setIsOpen(false); }}>
                                            Settings Test
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { setPage('settings_secrets'); setIsOpen(false); }}>
                                            Settings Secrets
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { editItem('board_viewer', 1); setIsOpen(false); }}>
                                            Board Viewer
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { editItem('doc_viewer', 1); setIsOpen(false); }}>
                                            Doc Viewer
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { setPage('wrong_url'); setIsOpen(false); }}>
                                            Wrong URL
                                        </button>
                                        <button className="debug-nav-item" onClick={() => { setPage('fixed_url'); setIsOpen(false); }}>
                                            Fixed URL
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section: Main Tab Switcher */}
                            <div className="debug-hub-section">
                                <div className="debug-hub-section-header" onClick={() => toggleSection('info')}>
                                    <div className="debug-hub-section-title">
                                        <SlidersHorizontal size={14} />
                                        <span>State & Main Tabs</span>
                                    </div>
                                    {collapsedSections.info ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                </div>
                                {!collapsedSections.info && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div className="debug-hub-state-row">
                                            <span>Current Page: <strong>{page}</strong></span>
                                            <span>Tab: <strong>{activeTab}</strong></span>
                                            <span>ID: <strong>{String(selectedId ?? 'none')}</strong></span>
                                        </div>
                                        <div className="debug-hub-grid">
                                            {['projects', 'pcbs', 'reworks', 'owners', 'tags', 'settings'].map(tab => (
                                                <button 
                                                    key={tab} 
                                                    className={`debug-nav-item ${activeTab === tab && page === tab ? 'active-tab-btn' : ''}`}
                                                    onClick={() => { setActiveTab(tab); setIsOpen(false); }}
                                                >
                                                    {tab.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer Tips */}
                        <div className="debug-hub-footer">
                            <span>Tip: Append <code>?debug=true</code> to any URL to load in debug mode.</span>
                        </div>

                    </div>
                </div>
            )}

            {/* Interactive Preview Modals */}
            <RemoveProject 
                isOpen={previewModal === 'project'} 
                onClose={() => setPreviewModal(null)} 
                onConfirm={() => {
                    alert('[Debug Preview] Confirmed project removal simulation!');
                    setPreviewModal(null);
                }}
                project={sampleProject}
            />

            <RemovePcb 
                isOpen={previewModal === 'pcb'} 
                onClose={() => setPreviewModal(null)} 
                onConfirm={() => {
                    alert('[Debug Preview] Confirmed PCB removal simulation!');
                    setPreviewModal(null);
                }}
                pcb={samplePcb}
            />

            <RemoveRework 
                isOpen={previewModal === 'rework'} 
                onClose={() => setPreviewModal(null)} 
                onConfirm={() => {
                    alert('[Debug Preview] Confirmed Rework removal simulation!');
                    setPreviewModal(null);
                }}
                rework={sampleRework}
            />

            <RemoveTag 
                isOpen={previewModal === 'tag'} 
                onClose={() => setPreviewModal(null)} 
                onConfirm={() => {
                    alert('[Debug Preview] Confirmed Tag removal simulation!');
                    setPreviewModal(null);
                }}
                tag={sampleTag}
                pcb={samplePcb}
            />
        </>
    );
}
