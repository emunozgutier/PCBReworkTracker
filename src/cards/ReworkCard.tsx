import { useState } from 'react';
import { ReworkCardHeader } from './ReworkCardHeader';
import { ReworkCardBody } from './ReworkCardBody';

interface ReworkCardProps {
    rework: any;
}

export function ReworkCard({ rework }: ReworkCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <ReworkCardHeader 
                rework={rework} 
                isExpanded={isExpanded} 
                onToggle={() => setIsExpanded(!isExpanded)} 
            />
            {isExpanded && <ReworkCardBody rework={rework} />}
        </div>
    );
}
