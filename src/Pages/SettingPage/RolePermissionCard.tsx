import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useGlobalSettings } from '../../store/useGlobalSettings';
import { useCurrentUser } from '../../store/useCurrentUser';
import { RolePermissionSubTable } from './RolePermissionSubTable';

export function RolePermissionCard() {
    const { allowGuestMinorRework, setAllowGuestMinorRework } = useGlobalSettings();
    const { currentUserRole, isSuperUser } = useCurrentUser();
    const [localGuestMinorRework, setLocalGuestMinorRework] = useState(allowGuestMinorRework);

    useEffect(() => {
        setLocalGuestMinorRework(allowGuestMinorRework);
    }, [allowGuestMinorRework]);

    const handleSaveChanges = () => {
        setAllowGuestMinorRework(localGuestMinorRework);
        alert("Permissions updated and saved successfully!");
    };

    // Actions configurations
    const projectActions = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Edit', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const pcbActions = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: true, guestAllowed: false },
        { name: 'Edit', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const reworkActions = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add High Priority', superUserAllowed: true, userAllowed: true, guestAllowed: false },
        { 
            name: 'Add Low Priority', 
            superUserAllowed: true, 
            userAllowed: true, 
            guestAllowed: localGuestMinorRework,
            canEditGuest: true,
            onGuestClick: () => setLocalGuestMinorRework(!localGuestMinorRework)
        },
        { name: 'Edit Own', superUserAllowed: true, userAllowed: true, guestAllowed: false, isEditRow: true },
        { name: 'Edit Others', superUserAllowed: true, userAllowed: false, guestAllowed: false, isEditRow: true },
        { name: 'Delete Own', superUserAllowed: true, userAllowed: true, guestAllowed: false },
        { name: 'Delete Others', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const userActions = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Edit Own', superUserAllowed: true, userAllowed: true, guestAllowed: false, isEditRow: true },
        { name: 'Edit Others', superUserAllowed: true, userAllowed: false, guestAllowed: false, isEditRow: true },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    const tagActions = [
        { name: 'View', superUserAllowed: true, userAllowed: true, guestAllowed: true },
        { name: 'Add', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Edit', superUserAllowed: true, userAllowed: false, guestAllowed: false },
        { name: 'Delete', superUserAllowed: true, userAllowed: false, guestAllowed: false },
    ];

    return (
        <div className="settings-main-card">
            <div className="settings-card-label">
                <ShieldCheck size={18} color="var(--accent)" />
                <span>Role Permissions Matrix</span>
            </div>
            <p className="settings-description">
                Overview of user capabilities based on active session role. Adjust your session role in the controller in the top-right corner to test permissions.
            </p>

            {isSuperUser && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <button
                        type="button"
                        onClick={handleSaveChanges}
                        className="submit-button"
                        style={{ margin: 0, padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px', width: 'auto', background: 'var(--accent)' }}
                    >
                        Save Changes
                    </button>
                </div>
            )}

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
                        <RolePermissionSubTable
                            resourceName="Projects"
                            rowSpan={4}
                            actions={projectActions}
                            currentUserRole={currentUserRole}
                        />
                        <RolePermissionSubTable
                            resourceName="PCBs"
                            rowSpan={4}
                            actions={pcbActions}
                            currentUserRole={currentUserRole}
                        />
                        <RolePermissionSubTable
                            resourceName="Reworks"
                            rowSpan={7}
                            actions={reworkActions}
                            currentUserRole={currentUserRole}
                        />
                        <RolePermissionSubTable
                            resourceName="Users"
                            rowSpan={5}
                            actions={userActions}
                            currentUserRole={currentUserRole}
                        />
                        <RolePermissionSubTable
                            resourceName="Tags"
                            rowSpan={4}
                            actions={tagActions}
                            currentUserRole={currentUserRole}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}
