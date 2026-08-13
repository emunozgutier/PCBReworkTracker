import { useEffect, useRef } from 'react';
import { ReworkCardHeader } from './ReworkCardHeader';
import { ReworkCardBody } from './ReworkCardBody';
import { useAppState } from '../../../store/useAppState';

interface ReworkCardProps {
    rework: any;
}

export function ReworkCard({ rework }: ReworkCardProps) {
    const { expandedRework, setExpandedRework } = useAppState();
    const isExpanded = expandedRework === rework.id.toString();
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded && cardRef.current) {
            setTimeout(() => {
                cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 350);
        }
    }, [isExpanded]);

    const handleToggle = () => {
        if (isExpanded) {
            setExpandedRework(null);
        } else {
            setExpandedRework(rework.id.toString());
        }
    };

    return (
        <div ref={cardRef} className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <ReworkCardHeader 
                rework={rework} 
                isExpanded={isExpanded} 
                onToggle={handleToggle} 
                showFullTitle={true}
            />
            {/* Animated expand/collapse wrapper using grid-template-rows trick */}
            <div className={`pcb-card-body-wrapper ${isExpanded ? 'pcb-card-body-wrapper--open' : ''}`}>
                <div className="pcb-card-body-inner">
                    <ReworkCardBody rework={rework} />
                </div>
            </div>
        </div>
    );
}
