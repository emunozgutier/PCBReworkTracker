import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { useTagStore } from '../store/storeTag';

interface AddTabProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddTab({ onBack, onSuccess }: AddTabProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#818cf8');
    const { addTag, loading } = useTagStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addTag({ name, color });
        if (success) {
            onSuccess();
        }
    };

    const colors = ['#818cf8', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Add New Tag (Tab)</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
                <div className="form-group">
                    <label htmlFor="name">Tag Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Prototype"
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
