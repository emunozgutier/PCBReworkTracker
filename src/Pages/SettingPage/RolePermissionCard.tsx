import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAppState } from '../../store/useAppState';
import { useCurrentUser } from '../../store/localDataBaseCopy/useCurrentUser';
import { usePermissionsStore, usePermissionsTable } from '../../store/localDataBaseCopy/usePermissionsStore';
import { RolePermissionSubTable } from './RolePermissionSubTable';

export function RolePermissionCard() {
    const { allowGuestMinorRework, setAllowGuestMinorRework } = useAppState();
    const { currentUserRole, isSuperUser } = useCurrentUser();
    const [selectedSubTable, setSelectedSubTable] = useState<'Projects' | 'PCBs' | 'Reworks' | 'Users' | 'Tags'>('Projects');
    const [showSavePopup, setShowSavePopup] = useState(false);
    
    // Captured snapshot of permissions upon mount/reset
    const [initialPermissions, setInitialPermissions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const current = usePermissionsStore.getState().permissions;
        
        // Sync allowGuestMinorRework with internal store
        usePermissionsStore.setState({
            permissions: {
                ...current,
                'Reworks__Add Low Priority__guest': allowGuestMinorRework
            }
        });
        
        // Record initial state snapshot
        setInitialPermissions({
            ...current,
            'Reworks__Add Low Priority__guest': allowGuestMinorRework
        });
    }, [allowGuestMinorRework]);

    const localPerms = usePermissionsStore((state) => state.permissions);
    const { projectActions, pcbActions, reworkActions, userActions, tagActions } = usePermissionsTable();

    // Compute diff comparison list
    const diffList: string[] = [];
    Object.keys(localPerms).forEach((key) => {
        const originalValue = initialPermissions[key];
        const currentValue = localPerms[key];
        if (originalValue !== undefined && originalValue !== currentValue) {
            const parts = key.split('__');
            if (parts.length === 3) {
                const resource = parts[0];
                const action = parts[1].replace(/ /g, '_');
                let role = parts[2];
                if (role === 'superUser') role = 'Super_User';
                else if (role === 'user') role = 'User';
                else if (role === 'guest') role = 'Guest';

                const oldValStr = originalValue ? 'True' : 'False';
                const newValStr = currentValue ? 'True' : 'False';

                diffList.push(`${resource}.${action}.${role}: ${oldValStr} -> ${newValStr}`);
            }
        }
    });

    const handleConfirmSave = () => {
        const currentVal = !!localPerms['Reworks__Add Low Priority__guest'];
        setAllowGuestMinorRework(currentVal);
        
        // Update initial state snapshot to clear diff visual
        setInitialPermissions({ ...localPerms });
        
        setShowSavePopup(false);
        alert("Permissions updated and saved successfully!");
    };

    return (
        <div className="settings-main-card">
            <div className="settings-card-label">
                <ShieldCheck size={18} color="var(--accent)" />
                <span>Role Permissions Matrix</span>
            </div>
            <p className="settings-description">
                Overview of user capabilities based on active session role. Adjust your session role in the controller in the top-right corner to test permissions.
            </p>

            {/* Selector and Save Button Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label htmlFor="subtable-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-d)' }}>
                        Select Permission Table:
                    </label>
                    <select
                        id="subtable-select"
                        value={selectedSubTable}
                        onChange={(e) => setSelectedSubTable(e.target.value as any)}
                        style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: 'var(--text-h)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="Projects">Projects</option>
                        <option value="PCBs">PCBs</option>
                        <option value="Reworks">Reworks</option>
                        <option value="Users">Users</option>
                        <option value="Tags">Tags</option>
                    </select>
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

            <div className="permissions-table-container">
                <table className="permissions-table">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Action</th>
                            <th className={`cb-header-cell ${currentUserRole === 'Super User' ? 'active-column' : ''}`}>Super User</th>
                            <th className={`cb-header-cell ${currentUserRole === 'User' ? 'active-column' : ''}`}>User</th>
                            <th className={`cb-header-cell ${currentUserRole === 'Guest' ? 'active-column' : ''}`}>Guest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedSubTable === 'Projects' && (
                            <RolePermissionSubTable
                                resourceName="Projects"
                                rowSpan={4}
                                actions={projectActions}
                                currentUserRole={currentUserRole}
                                isSuperUser={isSuperUser}
                            />
                        )}
                        {selectedSubTable === 'PCBs' && (
                            <RolePermissionSubTable
                                resourceName="PCBs"
                                rowSpan={4}
                                actions={pcbActions}
                                currentUserRole={currentUserRole}
                                isSuperUser={isSuperUser}
                            />
                        )}
                        {selectedSubTable === 'Reworks' && (
                            <RolePermissionSubTable
                                resourceName="Reworks"
                                rowSpan={7}
                                actions={reworkActions}
                                currentUserRole={currentUserRole}
                                isSuperUser={isSuperUser}
                            />
                        )}
                        {selectedSubTable === 'Users' && (
                            <RolePermissionSubTable
                                resourceName="Users"
                                rowSpan={5}
                                actions={userActions}
                                currentUserRole={currentUserRole}
                                isSuperUser={isSuperUser}
                            />
                        )}
                        {selectedSubTable === 'Tags' && (
                            <RolePermissionSubTable
                                resourceName="Tags"
                                rowSpan={4}
                                actions={tagActions}
                                currentUserRole={currentUserRole}
                                isSuperUser={isSuperUser}
                            />
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation comparison dialog modal */}
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
                            Review Permissions Changes
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-d)', marginBottom: '16px' }}>
                            The following modifications will be saved. Please confirm before proceeding.
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
                                onClick={() => setShowSavePopup(false)}
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
