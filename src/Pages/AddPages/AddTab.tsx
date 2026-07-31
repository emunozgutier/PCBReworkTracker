import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { COLORS } from '../../store/useStyles';
import { useTagStore } from '../../store/clientDataBase/useTagStore';
import { useAppState } from '../../store/useAppState';
import { useOwnerStore } from '../../store/clientDataBase/useOwnerStore';

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

    const type = 'public';
    const ownerId = '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const success = await addTag({ 
            name, 
            color, 
            type: 'public',
            owner_id: null
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
