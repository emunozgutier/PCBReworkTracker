import { PcbCardHeader } from './PcbCardHeader';
import { PcbCardBody } from './PcbCardBody';
import { useStore } from '../store/useStore';

interface PcbCardProps {
    pcb: any;
    onEdit: (id: number | string) => void;
}

export function PcbCard({ pcb, onEdit }: PcbCardProps) {
    const { expandedPcb, setExpandedPcb } = useStore();
    const isExpanded = expandedPcb === pcb.board_number;

    const handleToggle = () => {
        if (isExpanded) {
            setExpandedPcb(null);
        } else {
            setExpandedPcb(pcb.board_number);
        }
    };

    return (
        <div className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <PcbCardHeader 
                pcb={pcb} 
                isExpanded={isExpanded} 
                onToggle={handleToggle} 
                onEdit={onEdit} 
            />
            {isExpanded && <PcbCardBody pcb={pcb} />}
        </div>
    );
}
