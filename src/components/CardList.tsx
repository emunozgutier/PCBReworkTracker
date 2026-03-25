import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5002/api';

interface CardListProps {
    type: 'projects' | 'pcbs' | 'reworks' | 'tags';
    title: string;
}

export function CardList({ type, title }: CardListProps) {
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
                <button className="add-button">
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
                                        <h3>{item.name}</h3>
                                    </div>
                                    <p className="card-desc">{item.description}</p>
                                </>
                            )}
                            {/* Tags and Reworks logic can be expanded here */}
                            {type === 'tags' && (
                                <div className="tag-item" style={{ borderLeft: `4px solid ${item.color}` }}>
                                    <span>{item.name}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
