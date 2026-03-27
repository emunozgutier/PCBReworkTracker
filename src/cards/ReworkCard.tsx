import { useState } from 'react';
import { ReworkCardHeader } from './ReworkCardHeader';
import { ReworkCardBody } from './ReworkCardBody';

interface ReworkCardProps {
    rework: any;
    onEdit: (id: number | string) => void;
}

export function ReworkCard({ rework, onEdit }: ReworkCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <ReworkCardHeader 
                rework={rework} 
                isExpanded={isExpanded} 
                onToggle={() => setIsExpanded(!isExpanded)} 
                onEdit={onEdit} 
            />
            {isExpanded && <ReworkCardBody rework={rework} />}
        </div>
    );
}
