import { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { ProjectCard } from '../cards/ProjectCard';

import { API_BASE } from '../api';

import { useProjectStore } from '../store/storeProject';

interface CardListProps {
    type: 'projects' | 'pcbs' | 'reworks' | 'tags' | 'owners';
    title: string;
    onAdd: () => void;
    onEdit: (id: string | number) => void;
}

export function CardList({ type, title, onAdd, onEdit }: CardListProps) {
    const [localItems, setLocalItems] = useState<any[]>([]);
    const [localLoading, setLocalLoading] = useState(true);

    const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();

    useEffect(() => {
        if (type === 'projects') {
            fetchProjects();
        } else {
            setLocalLoading(true);
            setLocalItems([]); 
            fetch(`${API_BASE}/${type}`)
                .then(res => res.json())
                .then(data => {
                    setLocalItems(data);
                    setLocalLoading(false);
                })
                .catch(err => {
                    console.error(`Failed to fetch ${type}:`, err);
                    setLocalLoading(false);
                });
        }
    }, [type, fetchProjects]);

    const items = type === 'projects' ? projects : localItems;
    const loading = type === 'projects' ? projectsLoading : localLoading;

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
                    items.map((item) => {
                        if (type === 'projects') {
                            return <ProjectCard key={item.id} project={item} onEdit={onEdit} />;
                        }

                        return (
                            <div key={item.id} className="item-card">
                                <div className="card-actions-overlay">
                                    <button className="edit-button" onClick={() => onEdit(item.id)}>
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                {type === 'pcbs' && (
                                    <>
                                        <div className="card-title">
                                            <span className="board-num">{item.board_number}</span>
                                            <span className={`status-pill ${item.status?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="card-details">
                                            <p><strong>Project:</strong> {item.project_name || 'N/A'}</p>
                                            <p><strong>Owner:</strong> {item.owner_name || 'N/A'}</p>
                                            <p className="product-info">{item.product}</p>
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
                                            <span className="board-num">PCB #{item.pcb_board_number}</span>
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
                        );
                    })
                )}
            </div>
        </div>
    );
}
