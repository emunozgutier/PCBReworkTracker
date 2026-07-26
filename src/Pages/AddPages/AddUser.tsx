import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { useOwnerStore } from '../../store/useOwnerStore';

interface AddUserProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddUser({ onBack, onSuccess }: AddUserProps) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [superuser, setSuperuser] = useState(0);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const { addOwner, loading, error } = useOwnerStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await addOwner({ name, username, email, superuser });
        if (result.success) {
            if (result.qrCodeDataUrl) {
                setQrCode(result.qrCodeDataUrl);
            } else {
                onSuccess();
            }
        }
    };

    return (
        <div className="add-page-container">
            {qrCode && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                        <h2 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Save Your Authenticator QR Code!</h2>
                        <p style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>. This is your only chance to save it! You will need it to log in.
                        </p>
                        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', display: 'inline-block', marginBottom: '20px' }}>
                            <img src={qrCode} alt="TOTP QR Code" style={{ width: '200px', height: '200px' }} />
                        </div>
                        <button 
                            onClick={onSuccess}
                            style={{ display: 'block', width: '100%', padding: '12px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            I have scanned it
                        </button>
                    </div>
                </div>
            )}
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Add New Owner</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
                {error && (
                    <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        {error}
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Jane Smith"
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username (Max 8 characters, no spaces)</label>
                    <input 
                        id="username"
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value.toLowerCase())} 
                        placeholder="e.g. jsmith"
                        pattern="^\S+$"
                        maxLength={8}
                        title="Username cannot contain spaces and must be 8 characters or fewer"
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address (Optional)</label>
                    <input 
                        id="email"
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="e.g. jsmith@example.com"
                    />
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <input 
                        id="superuser"
                        type="checkbox" 
                        checked={superuser === 1} 
                        onChange={(e) => setSuperuser(e.target.checked ? 1 : 0)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                    <label htmlFor="superuser" style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}>Is Superuser</label>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Owner'}</span>
                </button>
            </form>
        </div>
    );
}
