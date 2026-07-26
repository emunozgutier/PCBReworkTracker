import { User, LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from './client';
import { useAppState } from '../store/useAppState';
import './UserLoginButton.css';

export function UserLoginButton() {
    const { owner, logout } = useAuthStore();
    const { setPage } = useAppState();

    const displayUser = owner ? owner.name : "Guest";
    
    const handleClick = () => {
        if (owner) {
            logout();
        } else {
            setPage('login');
        }
    };

    return (
        <button
            className="user-login-button"
            title={owner ? "Logged in as " + owner.name + ". Click to logout." : "Not logged in. Click to login."}
            onClick={handleClick}
        >
            {owner ? <LogOut size={18} /> : <LogIn size={18} />}
            <span>{displayUser}</span>
            <User size={18} style={{ marginLeft: '4px' }} />
        </button>
    );
}
