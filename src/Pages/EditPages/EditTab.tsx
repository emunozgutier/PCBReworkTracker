import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import { API_BASE, apiFetch } from '../../store/database/apiBridge';
import { useTagStore } from '../../store/localDataBaseCopy/useTagStore';
import { useOwnerStore } from '../../store/localDataBaseCopy/useOwnerStore';
import { useAppState } from '../../store/useAppState';
import { COLORS } from '../../store/useStyles';

interface EditTabProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

export function EditTab({ id, onBack, onSuccess }: EditTabProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#818cf8');
    const [type, setType] = useState<'public' | 'personal'>('public');
    const [ownerId, setOwnerId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const { updateTag, deleteTag } = useTagStore();
    const { owners, fetchOwners } = useOwnerStore();
    const { currentUser, currentUserRole } = useAppState();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (owners.length === 0) {
            fetchOwners();
        }
    }, [fetchOwners, owners.length]);

    useEffect(() => {
        apiFetch(`${API_BASE}/tags/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setName(data.name);
                    setColor(data.color || '#818cf8');
                    setType(data.type || 'public');
                    setOwnerId(data.owner_id ? data.owner_id.toString() : '');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const isSuperUser = currentUserRole === 'Super User';
    
    // Check if user owns the personal tag
    const isOwner = currentUser && type === 'personal' && (
        ownerId === currentUser.id.toString()
    );

    const hasAccess = isSuperUser || (currentUserRole === 'User' && type === 'personal' && isOwner);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const finalType = isSuperUser ? type : 'personal';
        const finalOwnerId = finalType === 'personal'
            ? (isSuperUser ? (ownerId || null) : (currentUser ? currentUser.id : null))
            : null;

        const success = await updateTag(id, { 
            name, 
            color, 
            type: finalType, 
            owner_id: finalOwnerId 
        });
        if (success) onSuccess();
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this tag?')) return;
        setSaving(true);
        const success = await deleteTag(id);
        if (success) onSuccess();
        setSaving(false);
    };

    const colors = [COLORS.indigo, COLORS.red, COLORS.emerald, COLORS.amber, COLORS.blue, COLORS.pink, COLORS.purpleAccent];

    if (loading) return <div className="loading">Loading Tag...</div>;

    if (!hasAccess) {
        return (
            <div className="add-page-container">
                <header className="add-page-header">
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Access Denied</h2>
                </header>
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>You do not have permission to edit this tag.</p>
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
                <h2>Edit Tag</h2>
                <button onClick={handleDelete} className="delete-icon-button" title="Delete Tag">
                    <Trash2 size={20} color="#ef4444" />
                </button>
            </header>

            <form onSubmit={handleUpdate} className="add-form">
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

                {isSuperUser ? (
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
                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Update Tag'}</span>
                </button>
            </form>
        </div>
    );
}
