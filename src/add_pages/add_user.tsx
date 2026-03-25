import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { API_BASE } from '../api';

interface AddUserProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddUser({ onBack, onSuccess }: AddUserProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/owners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to add user');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Add New Owner</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
                <div className="form-group">
                    <label htmlFor="name">Owner Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Jane Smith"
                        required 
                    />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Owner'}</span>
                </button>
            </form>
        </div>
    );
}
