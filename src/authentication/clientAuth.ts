/**
 * Client authentication cookie utilities
 */

export function setSessionCookie(token: string, days = 7): void {
    if (typeof window === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    // Secure and SameSite are recommended, but keep SameSite=Lax for compatibility
    document.cookie = `session_token=${token}${expires}; path=/; SameSite=Lax`;
}

export function getSessionCookie(): string | null {
    if (typeof window === 'undefined') return null;
    const nameEQ = "session_token=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function clearSessionCookie(): void {
    if (typeof window === 'undefined') return;
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
}
