import { Popup } from '../../components/Popup';
import { API_BASE } from '../../store/serverDataBase/apiBridge';
import { ExternalLink, FileText } from 'lucide-react';

interface ProjectDocViewProps {
    isOpen: boolean;
    onClose: () => void;
    doc: {
        id: number;
        filename: string;
        path: string;
    } | null;
}

export function ProjectDocView({ isOpen, onClose, doc }: ProjectDocViewProps) {
    if (!isOpen || !doc) return null;

    const fullUrl = doc.path.startsWith('http') ? doc.path : `${API_BASE.replace('/api', '')}/api${doc.path}`;

    const titleElement = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <FileText size={20} color="#ef4444" />
                <h3 
                    style={{ 
                        margin: 0, 
                        fontSize: '1.15rem', 
                        fontWeight: 600, 
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    title={doc.filename}
                >
                    {doc.filename}
                </h3>
            </div>
            <a 
                href={fullUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--accent)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
            >
                <span>Open in Tab</span>
                <ExternalLink size={12} />
            </a>
        </div>
    );

    return (
        <Popup 
            isOpen={isOpen} 
            onClose={onClose} 
            title={titleElement} 
            maxWidth="1000px"
        >
            <div 
                style={{ 
                    width: '100%', 
                    height: 'calc(80vh - 100px)', 
                    marginTop: '8px', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    background: '#0f172a'
                }}
            >
                <iframe 
                    src={`${fullUrl}#toolbar=1`}
                    title={doc.filename}
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none' }}
                />
            </div>
        </Popup>
    );
}
