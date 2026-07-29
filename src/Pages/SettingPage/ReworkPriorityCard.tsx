import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useCurrentUser } from '../../store/localDataBaseCopy/useCurrentUser';
import { usePriorityStore } from '../../store/localDataBaseCopy/usePriorityStore';

export function ReworkPriorityCard() {
    const { isSuperUser } = useCurrentUser();
    const [showSavePopup, setShowSavePopup] = useState(false);

    const committedPriorities = usePriorityStore((state) => state.priorities);
    const setPriorities = usePriorityStore((state) => state.setPriorities);

    // Local draft state of priorities
    const [draftPriorities, setDraftPriorities] = useState<Record<string, 'High' | 'Low'>>({});

    // Snapshot of committed state
    const [initialPriorities, setInitialPriorities] = useState<Record<string, 'High' | 'Low'>>({});

    useEffect(() => {
        setDraftPriorities({ ...committedPriorities });
        setInitialPriorities({ ...committedPriorities });
    }, [committedPriorities]);

    // Compute diff list
    const diffList: string[] = [];
    Object.keys(draftPriorities).forEach((key) => {
        const originalValue = initialPriorities[key];
        const currentValue = draftPriorities[key];
        if (originalValue !== undefined && originalValue !== currentValue) {
            diffList.push(`${key}: ${originalValue} Priority -> ${currentValue} Priority`);
        }
    });

    const handleConfirmSave = () => {
        // Commit priorities draft to store
        setPriorities(draftPriorities);
        // Sync initial snapshot
        setInitialPriorities({ ...draftPriorities });
        setShowSavePopup(false);
    };

    const handleCancelChanges = () => {
        // Discard local edits
        setDraftPriorities({ ...initialPriorities });
        setShowSavePopup(false);
    };

    const reworkTypes = ['Silicon Swap', 'Major Rework', 'Minor Rework', 'Resistor Swap'];

    return (
        <div className="settings-main-card">
            {/* Header flex row containing Title and Save Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="settings-card-label" style={{ margin: 0 }}>
                    <ShieldCheck size={18} color="var(--accent)" />
                    <span>Rework Priority Classification</span>
                </div>
                {isSuperUser && (
                    <button
                        type="button"
                        onClick={() => setShowSavePopup(true)}
                        className="submit-button"
                        style={{ margin: 0, padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px', width: 'auto', background: 'var(--accent)' }}
                    >
                        Save Changes
                    </button>
                )}
            </div>

            <p className="settings-description">
                Classification mapping rules showing priority assignment based on select rework types.
            </p>

            <div className="permissions-table-container">
                <table className="permissions-table" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Rework Type</th>
                            <th style={{ textAlign: 'center' }}>Classification Priority</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reworkTypes.map((type) => {
                            const priority = draftPriorities[type] || 'Low';
                            return (
                                <tr key={type}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{type}</td>
                                    <td style={{ textAlign: 'center', padding: '10px' }}>
                                        <select
                                            value={priority}
                                            disabled={!isSuperUser}
                                            onChange={(e) => setDraftPriorities(prev => ({ ...prev, [type]: e.target.value as 'High' | 'Low' }))}
                                            style={{
                                                background: priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                color: priority === 'High' ? '#ef4444' : '#10b981',
                                                border: `1px solid ${priority === 'High' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                                                borderRadius: '12px',
                                                padding: '4px 12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: isSuperUser ? 'pointer' : 'default',
                                                outline: 'none',
                                                textAlign: 'center',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                minWidth: '120px'
                                            }}
                                        >
                                            <option value="High" style={{ background: '#1e293b', color: '#ef4444' }}>High Priority</option>
                                            <option value="Low" style={{ background: '#1e293b', color: '#10b981' }}>Low Priority</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Review comparison modal popup */}
            {showSavePopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        color: 'var(--text-h)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.2rem', fontWeight: 700 }}>
                            Review Priority Changes
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-d)', marginBottom: '16px' }}>
                            The following priority classifications will be saved. Please confirm before proceeding.
                        </p>

                        <div style={{
                            maxHeight: '240px',
                            overflowY: 'auto',
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            {diffList.length === 0 ? (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-d)', fontStyle: 'italic' }}>
                                    No changes detected.
                                </span>
                            ) : (
                                diffList.map((diff, index) => (
                                    <div key={index} style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        color: '#34d399',
                                        wordBreak: 'break-all'
                                    }}>
                                        • {diff}
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={handleCancelChanges}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'var(--text-h)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={diffList.length === 0}
                                onClick={handleConfirmSave}
                                style={{
                                    background: diffList.length === 0 ? 'rgba(99, 102, 241, 0.4)' : 'var(--accent)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '0.85rem',
                                    cursor: diffList.length === 0 ? 'not-allowed' : 'pointer',
                                    opacity: diffList.length === 0 ? 0.6 : 1
                                }}
                            >
                                Confirm & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
