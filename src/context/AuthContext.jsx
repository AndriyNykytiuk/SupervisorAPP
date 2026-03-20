import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ── State shape ──────────────────────────────────────
const initialState = {
    user: null,
    selectedBrigade: null,
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
            return { ...initialState };
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
        const handleForceLogout = () => dispatch({ type: 'LOGOUT' });
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, []);

    const login = (userData) => {
        dispatch({ type: 'LOGIN', payload: userData });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
