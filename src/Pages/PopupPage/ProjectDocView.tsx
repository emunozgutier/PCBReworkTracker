import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE } from '../../store/serverDataBase/apiBridge';
import { TopBar } from '../../BoardViewer/TopBar';

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
    // Listen for Escape key and manage body overflow scroll lock
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !doc) return null;

    const fullUrl = doc.path.startsWith('http') ? doc.path : `${API_BASE.replace('/api', '')}/api${doc.path}`;

    return createPortal(
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                background: '#0b0f19', // Dark background matching theme
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9999,
                padding: '12px',
                boxSizing: 'border-box',
                gap: '12px'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Reuse the TopBar component */}
            <TopBar
                filename={doc.filename}
                onClose={onClose}
                showSearchToggle={false}
                fileType="pdf"
            />

            {/* Document display area */}
            <div 
                style={{ 
                    flex: 1,
                    width: '100%', 
                    borderRadius: '12px',
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
        </div>,
        document.body
    );
}
