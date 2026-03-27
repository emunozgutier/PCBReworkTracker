import { useState } from 'react';
import { PcbCardHeader } from './PcbCardHeader';
import { PcbCardBody } from './PcbCardBody';

interface PcbCardProps {
    pcb: any;
    onEdit: (id: number | string) => void;
}

export function PcbCard({ pcb, onEdit }: PcbCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <PcbCardHeader 
                pcb={pcb} 
                isExpanded={isExpanded} 
                onToggle={() => setIsExpanded(!isExpanded)} 
                onEdit={onEdit} 
            />
            {isExpanded && <PcbCardBody pcb={pcb} />}
        </div>
    );
}
