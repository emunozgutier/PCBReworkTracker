import { useState } from 'react';
import { Edit2, KeyRound, Copy, Check } from 'lucide-react';
import { useAppState } from '../../../store/useAppState';
import { apiFetch, API_BASE } from '../../../store/serverDataBase/apiBridge';

interface OwnerCardBodyProps {
    owner: any;
    onEdit?: (id: number | string) => void;
}

export function OwnerCardBody({ owner, onEdit }: OwnerCardBodyProps) {
    const { currentUser, currentUserRole } = useAppState();
    const [resetLink, setResetLink] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const isSuperUser = currentUserRole === 'Super User';
    const isSelf = currentUser && owner.id.toString() === currentUser.id.toString();
    const canEdit = isSuperUser || (currentUserRole === 'User' && isSelf);

    const handleResetOtp = async () => {
        setError('');
        setResetLink('');
        setIsResetting(true);
        try {
            const res = await apiFetch(`${API_BASE}/owners/${owner.id}/reset-otp`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error('Failed to generate reset link.');
            const data = await res.json();
            
            const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
            const fullUrl = window.location.origin + basePath + data.resetLink;
            setResetLink(fullUrl);
        } catch (err: any) {
            setError(err.message || 'Error generating reset link.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleCopyLink = () => {
        if (!resetLink) return;
        navigator.clipboard.writeText(resetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="card-expanded-content" style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {onEdit && (
                    <button
                        onClick={() => canEdit && onEdit(owner.id)}
                        disabled={!canEdit}
                        title={!canEdit ? "You can only edit your own profile" : "Edit profile details"}
                        className={canEdit ? "submit-button" : ""}
                        style={{
                            margin: 0,
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: canEdit ? 'var(--accent)' : 'none',
                            border: canEdit ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: canEdit ? '#fff' : 'var(--text-muted)',
                            borderRadius: '10px',
                            cursor: canEdit ? 'pointer' : 'not-allowed',
                            fontFamily: 'inherit',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            opacity: canEdit ? 1 : 0.5
                        }}
                    >
                        <Edit2 size={14} />
                        <span>Edit Profile</span>
                    </button>
                )}

                <button
                    onClick={handleResetOtp}
                    disabled={isResetting || !isSuperUser}
                    title={!isSuperUser ? "This is only for super users" : "Generate temporary OTP reset link"}
                    style={{
                        background: 'none',
                        border: `1px solid ${isSuperUser ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                        color: isSuperUser ? '#ef4444' : 'var(--text-muted)',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: isSuperUser ? 'pointer' : 'not-allowed',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        margin: 0,
                        opacity: isSuperUser ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                        if (isSuperUser) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (isSuperUser) {
                            e.currentTarget.style.background = 'none';
                        }
                    }}
                >
                    <KeyRound size={14} />
                    <span>{isResetting ? 'Resetting...' : 'Reset OTP'}</span>
                </button>
            </div>

            {error && (
                <div style={{ color: '#ef4444', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.8rem' }}>
                    {error}
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ 
                            padding: '10px 0', 
                            fontWeight: 600, 
                            color: 'var(--text-muted)', 
                            width: '80px', 
                            textTransform: 'uppercase', 
                            fontSize: '0.75rem', 
                            letterSpacing: '0.05em' 
                        }}>
                            Name
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>
                            {owner.name || 'No full name provided'}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ 
                            padding: '10px 0', 
                            fontWeight: 600, 
                            color: 'var(--text-muted)', 
                            width: '80px', 
                            textTransform: 'uppercase', 
                            fontSize: '0.75rem', 
                            letterSpacing: '0.05em' 
                        }}>
                            Email
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'monospace' }}>
                            {owner.email || 'No email address'}
                        </td>
                    </tr>
                </tbody>
            </table>

            {resetLink && (
                <div style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        OTP Reset Link (Valid for 15 minutes)
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="text"
                            readOnly
                            value={resetLink}
                            style={{
                                flex: 1,
                                padding: '6px 10px',
                                background: '#0f172a',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                color: 'var(--text)',
                                fontFamily: 'monospace'
                            }}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <button
                            onClick={handleCopyLink}
                            style={{
                                padding: '6px 12px',
                                background: 'var(--accent)',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
