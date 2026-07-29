import { useAppState } from './useAppState';

export function useCurrentUser() {
    const currentUser = useAppState(state => state.currentUser);
    const currentUserRole = useAppState(state => state.currentUserRole);
    const setCurrentUser = useAppState(state => state.setCurrentUser);
    const isSuperUser = currentUserRole === 'Super User';

    return {
        currentUser,
        currentUserRole,
        setCurrentUser,
        isSuperUser,
    };
}
