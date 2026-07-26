import { User } from 'lucide-react';
import { COLORS } from '../store/useStyles';

interface UserLoginButtonProps {
    userName?: string;
}

export function UserLoginButton({ userName }: UserLoginButtonProps) {
    const displayUser = userName || "Guest";
    
    return (
        <button
            className="user-login-button"
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1000,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: COLORS.purpleAccent,
                color: '#ffffff',
                border: 'none',
                borderBottomLeftRadius: '12px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: '-2px 2px 8px rgba(0,0,0,0.1)',
                opacity: 0.9,
                transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.9';
            }}
            title={userName ? "Logged in as " + userName : "Not logged in"}
        >
            <User size={16} />
            <span>{displayUser}</span>
        </button>
    );
}
