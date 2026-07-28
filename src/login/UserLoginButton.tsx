import { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, ShieldAlert, KeyRound } from 'lucide-react';
import { useAppState } from '../store/useAppState';
import { useOwnerStore } from '../store/useOwnerStore';
import './UserLoginButton.css';

export function UserLoginButton() {
    const { currentUser, currentUserRole, setCurrentUser } = useAppState();
    const { owners, fetchOwners } = useOwnerStore();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch owners on mount to populate dropdown
    useEffect(() => {
        fetchOwners();
    }, [fetchOwners]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Determine current display label
    let displayLabel = 'Guest';
    let roleBadgeColor = 'var(--text-muted)';
    
    if (currentUserRole === 'Super User') {
        displayLabel = currentUser ? `${currentUser.name} (Admin)` : 'Super User';
        roleBadgeColor = '#a855f7'; // purple
    } else if (currentUserRole === 'User' && currentUser) {
        displayLabel = `${currentUser.name} (User)`;
        roleBadgeColor = 'var(--accent)'; // indigo
    }

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'guest') {
            setCurrentUser(null, 'Guest');
        } else if (val === 'admin') {
            setCurrentUser(null, 'Super User');
        } else {
            const foundOwner = owners.find(o => o.username === val);
            if (foundOwner) {
                const isOnlyUser = owners.length === 1;
                const minId = owners.length > 0 ? Math.min(...owners.map(o => o.id)) : -1;
                const isFirstUser = foundOwner.id === minId;
                const role = (isOnlyUser || isFirstUser) ? 'Super User' : 'User';
                setCurrentUser(foundOwner, role);
            }
        }
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value as 'Super User' | 'User' | 'Guest';
        setCurrentUser(currentUser, val);
    };

    // Calculate current dropdown selected user value
    let selectUserVal = 'guest';
    if (currentUserRole === 'Super User' && !currentUser) {
        selectUserVal = 'admin';
    } else if (currentUser) {
        selectUserVal = currentUser.username;
    }

    // Determine available roles for the select dropdown
    const isGuestSelected = selectUserVal === 'guest';
    const isAdminSelected = selectUserVal === 'admin';

    return (
        <div ref={containerRef} className="user-login-container">
            <button
                className="user-login-button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    backgroundColor: currentUserRole === 'Super User' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    border: `1px solid ${currentUserRole === 'Super User' ? '#a855f7' : 'var(--border)'}`,
                    color: 'var(--text)',
                }}
                title={`Logged in as ${displayLabel}`}
            >
                <User size={18} style={{ color: roleBadgeColor }} />
                <span>{displayLabel}</span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
            </button>

            {isOpen && (
                <div className="user-login-dropdown">
                    <div className="dropdown-header">
                        <KeyRound size={16} color="var(--accent)" />
                        <span>Session Controller</span>
                    </div>

                    {/* Selector 1: Active User */}
                    <div className="dropdown-field">
                        <label htmlFor="auth-user-select">Active User</label>
                        <select 
                            id="auth-user-select"
                            value={selectUserVal} 
                            onChange={handleUserChange}
                        >
                            <option value="guest">Guest (Anonymous)</option>
                            <option value="admin">Super User (Administrator)</option>
                            <option disabled>──────────</option>
                            {owners.map(owner => (
                                <option key={owner.id} value={owner.username}>
                                    {owner.name} (@{owner.username})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector 2: Active Role */}
                    <div className="dropdown-field">
                        <label htmlFor="auth-role-select">Active Role</label>
                        <select
                            id="auth-role-select"
                            value={currentUserRole}
                            onChange={handleRoleChange}
                            disabled={isGuestSelected || isAdminSelected}
                        >
                            {isGuestSelected && <option value="Guest">Guest</option>}
                            {isAdminSelected && <option value="Super User">Super User</option>}
                            {!isGuestSelected && !isAdminSelected && (
                                <>
                                    <option value="User">User</option>
                                    <option value="Super User">Super User</option>
                                    <option value="Guest">Guest</option>
                                </>
                            )}
                        </select>
                    </div>

                    {/* Helper description of permissions */}
                    <div className="dropdown-footer">
                        <ShieldAlert size={14} />
                        <span>
                            {currentUserRole === 'Super User' && 'Full write & delete access'}
                            {currentUserRole === 'User' && 'Add new. Edit/delete own items only'}
                            {currentUserRole === 'Guest' && 'Read-only access'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

