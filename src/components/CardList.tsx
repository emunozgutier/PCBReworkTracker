import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5002/api';

interface CardListProps {
    type: 'projects' | 'pcbs' | 'reworks' | 'tags' | 'owners';
    title: string;
    onAdd: () => void;
}

export function CardList({ type, title, onAdd }: CardListProps) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setItems([]); // Clear old items to prevent rendering mismatch
        fetch(`${API_BASE}/${type}`)
            .then(res => res.json())
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(`Failed to fetch ${type}:`, err);
                setLoading(false);
            });
    }, [type]);

    if (loading) return <div className="loading">Loading {title}...</div>;

    return (
        <div className="card-list-container">
            <div className="list-header">
                <h2>{title}</h2>
                <button className="add-button" onClick={onAdd}>
                    <Plus size={18} />
                    <span>Add New</span>
                </button>
            </div>
            <div className="cards-grid">
                {items.length === 0 ? (
                    <div className="empty-state">No {type} found.</div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="item-card">
                            {type === 'pcbs' && (
                                <>
                                    <div className="card-title">
                                        <span className="board-num">{item.board_number}</span>
                                        <span className={`status-pill ${item.status?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="card-details">
                                        <p><strong>Project:</strong> {item.project}</p>
                                        <p><strong>Owner:</strong> {item.owner}</p>
                                        <p className="product-info">{item.product}</p>
                                    </div>
                                </>
                            )}
                            {type === 'projects' && (
                                <>
                                    <div className="card-title">
                                        <span className="board-num">{item.name}</span>
                                    </div>
                                    <div className="card-details">
                                        <p>{item.description}</p>
                                    </div>
                                </>
                            )}
                            {type === 'owners' && (
                                <>
                                    <div className="card-title">
                                        <span className="board-num">{item.name}</span>
                                    </div>
                                    <div className="card-details">
                                        <p>Active Owner</p>
                                    </div>
                                </>
                            )}
                            {type === 'reworks' && (
                                <>
                                    <div className="card-title">
                                        <span className="board-num">PCB #{item.pcb_id}</span>
                                        <span className="status-pill">{item.status}</span>
                                    </div>
                                    <div className="card-details">
                                        <p>{item.description}</p>
                                        <p><small>{new Date(item.timestamp).toLocaleString()}</small></p>
                                    </div>
                                </>
                            )}
                            {type === 'tags' && (
                                <div className="card-title" style={{ marginBottom: 0 }}>
                                    <span className="board-num">{item.name}</span>
                                    <div 
                                        style={{ 
                                            width: 16, height: 16, borderRadius: '50%', 
                                            backgroundColor: item.color || '#818cf8' 
                                        }} 
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
