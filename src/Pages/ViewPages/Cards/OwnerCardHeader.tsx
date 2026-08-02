import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppState } from '../../../store/useAppState';
import { useOwnerStore } from '../../../store/clientDataBase/useOwnerStore';
import { InfoPill } from '../../../components/InfoPill';

interface OwnerCardHeaderProps {
    owner: any;
    isExpanded: boolean;
    onToggle: () => void;
}

export function OwnerCardHeader({ owner, isExpanded, onToggle }: OwnerCardHeaderProps) {
    const isMobile = useAppState(state => state.isMobile);
    const { owners } = useOwnerStore();

    const isOnlyUser = owners.length === 1;
    const minId = owners.length > 0 ? Math.min(...owners.map(o => o.id)) : -1;
    const isFirstUser = owner.id === minId;
    const isOwnerSuperUser = isOnlyUser || isFirstUser;

    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', width: '100%', cursor: 'pointer' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <InfoPill
                        text={owner.username ? owner.username : 'No username'}
                        color="var(--text)"
                        bg="transparent"
                        border="none"
                        min_width={8}
                        center={false}
                        style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}
                    />
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isOwnerSuperUser ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: isOwnerSuperUser ? '#c084fc' : '#818cf8',
                        border: `1px solid ${isOwnerSuperUser ? 'rgba(168, 85, 247, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                    }}>
                        {isOwnerSuperUser ? 'Super User' : 'User'}
                    </span>
                    {(!isMobile && owner.name) && (
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }} title={owner.name}>
                            {owner.name && owner.name.length > 20 ? `${owner.name.substring(0, 20)}...` : owner.name}
                        </span>
                    )}
                    {(!isMobile && owner.email) && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '12px' }}>
                            {owner.email}
                        </span>
                    )}
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="pcb-mini-list" style={{ gap: '6px' }}>
                    <span className="pcb-pill" style={{ padding: '2px 8px', fontSize: '0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                        {owner.pcb_count || 0} PCBs
                    </span>
                </div>
                <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>
        </div>
    );
}
