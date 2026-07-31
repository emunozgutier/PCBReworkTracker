import { useState, useEffect, useRef } from 'react';
import { User as UserIcon, ChevronDown, KeyRound, RefreshCw, LogOut } from 'lucide-react';
import { useAppState } from '../store/useAppState';
import { useOwnerStore } from '../store/clientDataBase/useOwnerStore';
import { Popup } from '../components/Popup';
import { API_BASE, apiFetch } from '../store/serverDataBase/apiBridge';
import './UserLoginButton.css';

export function UserLoginButton() {
    const { currentUser, currentUserRole, setCurrentUser, isMobile } = useAppState();
    const { owners, fetchOwners } = useOwnerStore();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Login modal states
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedUsername, setSelectedUsername] = useState('');
    const [loginOtp, setLoginOtp] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginVerifying, setLoginVerifying] = useState(false);

    // Fetch owners on mount to populate dropdown
    useEffect(() => {
        fetchOwners();
    }, [fetchOwners]);

    // Auto-select first owner when owners list loads
    useEffect(() => {
        if (!selectedUsername && owners.length > 0) {
            setSelectedUsername(owners[0].username);
        }
    }, [owners, selectedUsername]);

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
    let displayLabel = 'Login';
    let roleBadgeColor = 'var(--text-muted)';
    
    if (currentUserRole === 'Super User') {
        displayLabel = currentUser ? currentUser.username : 'Super User';
        roleBadgeColor = '#a855f7'; // purple
    } else if (currentUserRole === 'User' && currentUser) {
        displayLabel = currentUser.username;
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

    const isGuestSelected = selectUserVal === 'guest';
    const isAdminSelected = selectUserVal === 'admin';

    // Find if the currently selected user in modal has OTP
    const selectedOwner = owners.find(o => o.username === selectedUsername);
    const hasOtpSecret = selectedOwner && !!selectedOwner.otp_secret;

    const handleModalLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (!selectedUsername) {
            setLoginError('Please select a user to log in.');
            return;
        }

        if (selectedUsername === 'admin') {
            // Admin bypasses OTP or doesn't have it configed
            setCurrentUser(null, 'Super User');
            setShowLoginModal(false);
            setSelectedUsername('');
            setLoginOtp('');
            return;
        }

        if (selectedOwner) {
            if (hasOtpSecret && (!loginOtp || loginOtp.length !== 6)) {
                setLoginError('Please enter a 6-digit verification code.');
                return;
            }
            setLoginVerifying(true);
            try {
                const res = await apiFetch(`${API_BASE}/otp/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: selectedOwner.username,
                        secret: hasOtpSecret ? selectedOwner.otp_secret : null, 
                        token: hasOtpSecret ? loginOtp : null 
                    })
                });
                
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Verification failed.');
                }
                
                if (!data.valid) {
                    throw new Error('Invalid 6-digit verification code. Please check your authenticator.');
                }
            } catch (err: any) {
                setLoginError(err.message || 'Error verifying OTP code.');
                setLoginVerifying(false);
                return;
            } finally {
                setLoginVerifying(false);
            }

            // Successfully authenticated or bypassed OTP!
            const isOnlyUser = owners.length === 1;
            const minId = owners.length > 0 ? Math.min(...owners.map(o => o.id)) : -1;
            const isFirstUser = selectedOwner.id === minId;
            const role = (isOnlyUser || isFirstUser) ? 'Super User' : 'User';
            
            setCurrentUser(selectedOwner, role);
            setShowLoginModal(false);
            setSelectedUsername('');
            setLoginOtp('');
        }
    };

    return (
        <div ref={containerRef} className="user-login-container">
            <button
                className="user-login-button"
                onClick={() => {
                    if (currentUserRole === 'Guest') {
                        setShowLoginModal(true);
                    } else {
                        setIsOpen(!isOpen);
                    }
                }}
                style={{
                    backgroundColor: currentUserRole === 'Super User' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    border: `1px solid ${currentUserRole === 'Super User' ? '#a855f7' : 'var(--border)'}`,
                    color: 'var(--text)',
                }}
                title={`Logged in as ${displayLabel}`}
            >
                {!isMobile && <UserIcon size={18} style={{ color: roleBadgeColor }} />}
                <span>{displayLabel}</span>
                {currentUserRole !== 'Guest' && <ChevronDown size={14} style={{ opacity: 0.6 }} />}
            </button>

            {isOpen && currentUserRole !== 'Guest' && (
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
                                    {owner.name}
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

                    {/* Logout Button */}
                    <button
                        onClick={() => {
                            setCurrentUser(null, 'Guest');
                            setIsOpen(false);
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: '12px',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                    >
                        <LogOut size={14} />
                        <span>Logout</span>
                    </button>
                </div>
            )}

            <Popup
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setSelectedUsername(owners[0]?.username || '');
                    setLoginOtp('');
                    setLoginError('');
                }}
                title="Account Login"
                maxWidth="360px"
            >
                <form onSubmit={handleModalLoginSubmit} className="add-form" style={{ margin: 0, padding: 0 }}>
                    {loginError && (
                        <div style={{ color: '#ef4444', marginBottom: '16px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.85rem' }}>
                            {loginError}
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="modal-user-select">Select User</label>
                        <select
                            id="modal-user-select"
                            value={selectedUsername}
                            onChange={(e) => {
                                setSelectedUsername(e.target.value);
                                setLoginOtp('');
                                setLoginError('');
                            }}
                            required
                        >
                            {owners.map(owner => (
                                <option key={owner.id} value={owner.username}>
                                    {owner.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label htmlFor="login-otp-token">Google Authenticator OTP Code</label>
                        <input
                            id="login-otp-token"
                            type="text"
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder={!selectedUsername ? "Select user first" : (!hasOtpSecret ? "OTP not configured" : "Enter 6-digit code")}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            required={selectedUsername ? hasOtpSecret : true}
                            disabled={!selectedUsername || !hasOtpSecret}
                            style={{ 
                                textAlign: 'center', 
                                fontSize: '1.25rem', 
                                letterSpacing: '2px', 
                                fontWeight: 'bold',
                                opacity: !selectedUsername || !hasOtpSecret ? 0.6 : 1
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loginVerifying}
                        style={{ width: '100%', justifyContent: 'center', margin: 0 }}
                    >
                        {loginVerifying ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" style={{ marginRight: '6px' }} />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <span>Login</span>
                        )}
                    </button>
                </form>
            </Popup>
        </div>
    );
}
