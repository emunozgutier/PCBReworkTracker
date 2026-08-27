import { useState, useEffect } from 'react';
import { 
    Database, 
    Folder, 
    DownloadCloud, 
    Save, 
    RefreshCw, 
    AlertTriangle, 
    CheckCircle2, 
    Sparkles, 
    Trash2, 
    HardDrive,
    FileText
} from 'lucide-react';
import { useAppState } from '../../store/useAppState';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { useReworkStore } from '../../store/clientDataBase/useReworkStore';
import { useOwnerStore } from '../../store/clientDataBase/useOwnerStore';
import { useTagStore } from '../../store/clientDataBase/useTagStore';
import { API_BASE, apiFetch } from '../../store/serverDataBase/apiBridge';

interface BackupItem {
    filename: string;
    path: string;
    size: number;
    createdAt: string;
}

export function DbSettingsCard() {
    const { currentUserRole } = useAppState();
    const isSuperUser = currentUserRole === 'Super User';

    const [backupPath, setBackupPath] = useState('');
    const [defaultBackupPath, setDefaultBackupPath] = useState('');
    const [currentMode, setCurrentMode] = useState<'production' | 'demo' | 'empty'>('production');
    const [selectedMode, setSelectedMode] = useState<'production' | 'demo' | 'empty'>('production');
    const [backups, setBackups] = useState<BackupItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [savePathLoading, setSavePathLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [showBackupsList, setShowBackupsList] = useState(false);

    const loadDbSettings = async () => {
        try {
            setLoading(true);
            const res = await apiFetch(`${API_BASE}/db/settings`);
            if (res.ok) {
                const data = await res.json();
                setBackupPath(data.backup_path || '');
                setDefaultBackupPath(data.default_backup_path || '');
                const mode = data.current_mode || 'production';
                setCurrentMode(mode);
                setSelectedMode(mode);
                setBackups(data.backups || []);
            }
        } catch (err: any) {
            console.error('Failed to load DB settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDbSettings();
    }, []);

    const handleSaveBackupPath = async () => {
        if (!backupPath.trim()) return;
        try {
            setSavePathLoading(true);
            setStatusMessage(null);
            const res = await apiFetch(`${API_BASE}/db/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backup_path: backupPath.trim() })
            });
            if (res.ok) {
                setStatusMessage({ type: 'success', text: 'Backup directory location saved successfully.' });
                loadDbSettings();
            } else {
                const errData = await res.json().catch(() => ({}));
                setStatusMessage({ type: 'error', text: errData.error || 'Failed to update backup directory.' });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Error saving backup directory.' });
        } finally {
            setSavePathLoading(false);
        }
    };

    const handleBackupNow = async () => {
        try {
            setBackupLoading(true);
            setStatusMessage(null);
            const res = await apiFetch(`${API_BASE}/db/backup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backup_path: backupPath.trim() || undefined })
            });
            if (res.ok) {
                const data = await res.json();
                const filename = data.backup ? data.backup.filename : 'snapshot';
                setStatusMessage({ 
                    type: 'success', 
                    text: `Database snapshot created successfully: ${filename}` 
                });
                loadDbSettings();
            } else {
                const errData = await res.json().catch(() => ({}));
                setStatusMessage({ type: 'error', text: errData.error || 'Failed to create database backup.' });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Error creating database backup.' });
        } finally {
            setBackupLoading(false);
        }
    };

    const handleApplyMode = async () => {
        try {
            setLoading(true);
            setStatusMessage(null);
            setConfirmModalOpen(false);
            const res = await apiFetch(`${API_BASE}/db/mode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: selectedMode })
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentMode(selectedMode);
                setStatusMessage({ 
                    type: 'success', 
                    text: data.message || `Database mode updated to ${selectedMode}.` 
                });

                // Refresh client stores so all UI updates in real-time
                await Promise.all([
                    useProjectStore.getState().fetchProjects(),
                    usePcbStore.getState().fetchPcbs(),
                    useTagStore.getState().fetchTags(),
                    useReworkStore.getState().fetchReworks(),
                    useOwnerStore.getState().fetchOwners()
                ]);

                loadDbSettings();
            } else {
                const errData = await res.json().catch(() => ({}));
                setStatusMessage({ type: 'error', text: errData.error || 'Failed to switch database mode.' });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Error switching database mode.' });
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="settings-main-card">
            {/* Header */}
            <div className="settings-card-label" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Database size={18} color="var(--accent)" />
                    <span>Database Management & Test Mode Settings</span>
                </div>
                <span 
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: currentMode === 'demo' ? 'rgba(99, 102, 241, 0.15)' : currentMode === 'empty' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: currentMode === 'demo' ? 'var(--accent)' : currentMode === 'empty' ? '#ef4444' : '#10b981',
                        border: `1px solid ${currentMode === 'demo' ? 'rgba(99, 102, 241, 0.3)' : currentMode === 'empty' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}
                >
                    Active: {currentMode === 'demo' ? 'Demo DB' : currentMode === 'empty' ? 'Empty DB' : 'Production DB'}
                </span>
            </div>

            <p className="settings-description">
                Configure database backup storage locations, perform instant backups, or switch database datasets between Production, Demo, and Empty modes for testing.
            </p>

            {/* Status Alert */}
            {statusMessage && (
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 16px',
                        borderRadius: 12,
                        marginBottom: 20,
                        fontSize: '0.88rem',
                        fontWeight: 500,
                        background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        color: statusMessage.type === 'success' ? '#10b981' : '#ef4444'
                    }}
                >
                    {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    <span style={{ flex: 1 }}>{statusMessage.text}</span>
                    <button 
                        type="button" 
                        onClick={() => setStatusMessage(null)}
                        style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Section 1: Backup Folder & Instant Snapshot */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Folder size={16} color="var(--text-muted)" />
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)' }}>
                        Database Backup Folder Location
                    </label>
                </div>
                
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
                        <input
                            type="text"
                            value={backupPath}
                            onChange={(e) => setBackupPath(e.target.value)}
                            placeholder={defaultBackupPath || 'e.g. /path/to/backups'}
                            className="calculator-input"
                            style={{ margin: 0, paddingRight: 40 }}
                            disabled={!isSuperUser}
                        />
                    </div>
                    {isSuperUser && (
                        <>
                            <button
                                type="button"
                                onClick={handleSaveBackupPath}
                                disabled={savePathLoading || !backupPath.trim()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '0 16px',
                                    borderRadius: 12,
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-h)',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minHeight: 46
                                }}
                            >
                                <Save size={15} />
                                <span>{savePathLoading ? 'Saving...' : 'Save Location'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleBackupNow}
                                disabled={backupLoading}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '0 18px',
                                    borderRadius: 12,
                                    background: 'var(--accent)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                                    transition: 'all 0.2s ease',
                                    minHeight: 46
                                }}
                            >
                                <DownloadCloud size={16} />
                                <span>{backupLoading ? 'Backing Up...' : 'Backup Now'}</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Backups summary / toggler */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {backups.length} snapshot{backups.length !== 1 ? 's' : ''} available in backup folder
                    </span>
                    {backups.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowBackupsList(!showBackupsList)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            {showBackupsList ? 'Hide Backup History ▲' : 'Show Backup History ▼'}
                        </button>
                    )}
                </div>

                {/* Recent Backups Drawer */}
                {showBackupsList && backups.length > 0 && (
                    <div 
                        style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: 12,
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid var(--border)',
                            maxHeight: 180,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        }}
                    >
                        {backups.map((b, idx) => (
                            <div 
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '0.8rem',
                                    padding: '8px 12px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255, 255, 255, 0.04)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FileText size={14} color="var(--accent)" />
                                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-h)', fontWeight: 500 }}>
                                        {b.filename}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
                                    <span>{formatBytes(b.size)}</span>
                                    <span>{new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

            {/* Section 2: Database Mode Selection (Testing) */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Sparkles size={16} color="var(--accent)" />
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-h)' }}>
                        Database Mode (For Testing & Development)
                    </label>
                </div>
                <p className="settings-description" style={{ marginBottom: 16 }}>
                    Select an operating database mode below. You can quickly seed full demo fixtures or clean the database to a blank slate for isolated testing.
                </p>

                <div className="settings-options-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
                    {/* Mode 1: Production */}
                    <div
                        className={`setting-choice-card ${selectedMode === 'production' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('production')}
                    >
                        <div className="choice-card-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <HardDrive size={16} color="#10b981" />
                                <span className="choice-title" style={{ fontSize: '0.98rem' }}>Production DB</span>
                            </div>
                            <div className="choice-radio">
                                {selectedMode === 'production' && (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                            Standard live workspace database without automated test resets.
                        </p>
                        <div className="choice-example-badge" style={{ padding: '6px 10px' }}>
                            <span className="example-tag" style={{ fontSize: '0.7rem', color: '#10b981' }}>Live Schema</span>
                        </div>
                    </div>

                    {/* Mode 2: Demo */}
                    <div
                        className={`setting-choice-card ${selectedMode === 'demo' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('demo')}
                    >
                        <div className="choice-card-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Database size={16} color="var(--accent)" />
                                <span className="choice-title" style={{ fontSize: '0.98rem' }}>Demo DB</span>
                            </div>
                            <div className="choice-radio">
                                {selectedMode === 'demo' && (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                            Populate with Dione, Titan, Atlas packages, revisions, PCBs, tags & reworks.
                        </p>
                        <div className="choice-example-badge" style={{ padding: '6px 10px' }}>
                            <span className="example-tag" style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>Full Demo Fixtures</span>
                        </div>
                    </div>

                    {/* Mode 3: Empty */}
                    <div
                        className={`setting-choice-card ${selectedMode === 'empty' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('empty')}
                    >
                        <div className="choice-card-top">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Trash2 size={16} color="#ef4444" />
                                <span className="choice-title" style={{ fontSize: '0.98rem' }}>Empty DB</span>
                            </div>
                            <div className="choice-radio">
                                {selectedMode === 'empty' && (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                            Clean slate with zero projects or boards. Preserves admin logins for testing.
                        </p>
                        <div className="choice-example-badge" style={{ padding: '6px 10px' }}>
                            <span className="example-tag" style={{ fontSize: '0.7rem', color: '#ef4444' }}>Zero Records</span>
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                {isSuperUser && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => setConfirmModalOpen(true)}
                            disabled={loading || selectedMode === currentMode}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 24px',
                                borderRadius: 12,
                                background: selectedMode === currentMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent)',
                                color: selectedMode === currentMode ? 'var(--text-muted)' : '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: selectedMode === currentMode ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: selectedMode !== currentMode ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
                            }}
                        >
                            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                            <span>{loading ? 'Applying Changes...' : `Apply ${selectedMode === 'demo' ? 'Demo DB' : selectedMode === 'empty' ? 'Empty DB' : 'Production DB'}`}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModalOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16
                    }}
                >
                    <div 
                        style={{
                            background: 'var(--card-bg, #1e293b)',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: 24,
                            maxWidth: 480,
                            width: '100%',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div 
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ef4444'
                                }}
                            >
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-h)' }}>
                                    Confirm Database Switch
                                </h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Switching to {selectedMode.toUpperCase()} mode
                                </span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: 16 }}>
                            {selectedMode === 'demo' && (
                                <>This will replace existing database records with the comprehensive <strong>Demo Dataset</strong> (Dione, Titan, Atlas with packages, form factors, revisions, BOMs, PCBs, and reworks).</>
                            )}
                            {selectedMode === 'empty' && (
                                <>This will <strong>clear all projects, packages, PCBs, tags, and rework logs</strong> to provide an empty clean testing slate. Default admin credentials will be preserved.</>
                            )}
                            {selectedMode === 'production' && (
                                <>This will switch the active mode flag to <strong>Production DB</strong>.</>
                            )}
                        </p>

                        <div 
                            style={{
                                padding: '10px 14px',
                                borderRadius: 10,
                                background: 'rgba(99, 102, 241, 0.08)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                marginBottom: 24,
                                fontSize: '0.8rem',
                                color: 'var(--accent)'
                            }}
                        >
                            ✓ A safety backup snapshot will be saved automatically before changes are applied.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 10,
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyMode}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 10,
                                    background: selectedMode === 'empty' ? '#ef4444' : 'var(--accent)',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    boxShadow: selectedMode === 'empty' ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                Yes, Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
