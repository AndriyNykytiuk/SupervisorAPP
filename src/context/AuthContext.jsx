import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ── Token validity helpers ───────────────────────────
// Decode JWT payload (base64url) and check the exp claim.
// Returns false for missing/malformed/expired tokens.
const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!payload.exp) return true; // no exp claim → treat as non-expiring
        return Date.now() < payload.exp * 1000;
    } catch {
        return false;
    }
};

const clearAuthStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// ── State shape ──────────────────────────────────────
// On boot, treat the user as logged-in only if both the user record AND
// a non-expired token are still in localStorage. Otherwise scrub stale state.
const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
const bootValid = savedUser && isTokenValid();
if (savedUser && !bootValid) clearAuthStorage();

const initialState = {
    user: bootValid ? savedUser : null,
    selectedBrigade: bootValid && savedUser ? savedUser.brigadeId : null,
};

// ── Reducer ──────────────────────────────────────────
function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload,
                selectedBrigade: action.payload.brigadeId || null,
            };
        case 'LOGOUT':
            return { user: null, selectedBrigade: null };
        case 'SET_BRIGADE':
            return { ...state, selectedBrigade: action.payload };
        default:
            return state;
    }
}

// ── Context ──────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Listen for forced logout from the axios 401 interceptor
    useEffect(() => {
        const handleForceLogout = () => {
            clearAuthStorage();
            dispatch({ type: 'LOGOUT' });
        };
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, []);

    // Proactive expiry check — kick the user out the moment the JWT exp
    // passes, without waiting for the next API call to fail with 401.
    // Also re-checks on tab focus (long sleep / standby case).
    useEffect(() => {
        if (!state.user) return;

        const enforce = () => {
            if (!isTokenValid()) {
                window.dispatchEvent(new Event('auth:logout'));
            }
        };

        const intervalId = setInterval(enforce, 60_000);
        const onVisible = () => { if (document.visibilityState === 'visible') enforce(); };
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [state.user]);

    const login = (userData) => {
        dispatch({ type: 'LOGIN', payload: userData });
    };

    const logout = () => {
        clearAuthStorage();
        dispatch({ type: 'LOGOUT' });
    };

    const setBrigade = (brigadeId) => {
        dispatch({ type: 'SET_BRIGADE', payload: brigadeId });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, setBrigade }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ─────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
