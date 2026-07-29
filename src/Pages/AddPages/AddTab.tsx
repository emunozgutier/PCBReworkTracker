import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { COLORS } from '../../store/useStyles';
import { useTagStore } from '../../store/localDataBaseCopy/useTagStore';
import { useAppState } from '../../store/useAppState';
import { useOwnerStore } from '../../store/localDataBaseCopy/useOwnerStore';

interface AddTabProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddTab({ onBack, onSuccess }: AddTabProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#818cf8');
    const { addTag, loading } = useTagStore();
    const { currentUser, currentUserRole } = useAppState();
    const { owners, fetchOwners } = useOwnerStore();

    // Default tag type: public for Super User, personal for User
    const [type, setType] = useState<'public' | 'personal'>(
        currentUserRole === 'Super User' ? 'public' : 'personal'
    );
    const [ownerId, setOwnerId] = useState<string>('');

    useEffect(() => {
        if (owners.length === 0) {
            fetchOwners();
        }
    }, [fetchOwners, owners.length]);

    useEffect(() => {
        // Set default ownerId to currentUser if it exists
        if (currentUser) {
            setOwnerId(currentUser.id.toString());
        } else if (owners.length > 0) {
            setOwnerId(owners[0].id.toString());
        }
    }, [currentUser, owners]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalType = currentUserRole === 'Super User' ? type : 'personal';
        const finalOwnerId = finalType === 'personal'
            ? (currentUserRole === 'Super User' ? (ownerId || null) : (currentUser ? currentUser.id : null))
            : null;

        const success = await addTag({ 
            name, 
            color, 
            type: finalType,
            owner_id: finalOwnerId
        });
        if (success) {
            onSuccess();
        }
    };

    const colors = [COLORS.indigo, COLORS.red, COLORS.emerald, COLORS.amber, COLORS.blue, COLORS.pink, COLORS.purpleAccent];

    // Access check: Guests cannot add tags
    if (currentUserRole !== 'Super User' && currentUserRole !== 'User') {
        return (
            <div className="add-page-container">
                <header className="add-page-header">
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Access Denied</h2>
                </header>
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>You do not have permission to add tags.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Add New Tag</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
                <div className="form-group">
                    <label htmlFor="name">Tag Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '');
                            setName(val);
                        }} 
                        placeholder="e.g. tag-name"
                        required 
                    />
                </div>

                {currentUserRole === 'Super User' ? (
                    <>
                        <div className="form-group">
                            <label htmlFor="type">Tag Type</label>
                            <select 
                                id="type" 
                                value={type} 
                                onChange={(e) => setType(e.target.value as 'public' | 'personal')}
                            >
                                <option value="public">Public</option>
                                <option value="personal">Personal</option>
                            </select>
                        </div>

                        {type === 'personal' && (
                            <div className="form-group">
                                <label htmlFor="owner_id">Assigned Owner</label>
                                <select 
                                    id="owner_id" 
                                    value={ownerId} 
                                    onChange={(e) => setOwnerId(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {owners.map(o => (
                                        <option key={o.id} value={o.id}>{o.name} (@{o.username})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="form-group">
                        <label>Tag Type</label>
                        <input 
                            type="text" 
                            value={`Personal (Assigned to @${currentUser?.username || currentUser?.name})`}
                            disabled 
                            className="disabled-input-locked"
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>Choose Color</label>
                    <div className="color-presets">
                        {colors.map(c => (
                            <button 
                                key={c}
                                type="button"
                                className={`color-preset ${color === c ? 'active' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Tag'}</span>
                </button>
            </form>
        </div>
    );
}
