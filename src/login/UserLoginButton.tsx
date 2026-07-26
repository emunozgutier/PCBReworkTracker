import { User } from 'lucide-react';
import './UserLoginButton.css';

interface UserLoginButtonProps {
    userName?: string;
}

export function UserLoginButton({ userName }: UserLoginButtonProps) {
    const displayUser = userName || "Guest";
    
    return (
        <button
            className="user-login-button"
            title={userName ? "Logged in as " + userName : "Not logged in"}
        >
            <User size={18} />
            <span>{displayUser}</span>
        </button>
    );
}
