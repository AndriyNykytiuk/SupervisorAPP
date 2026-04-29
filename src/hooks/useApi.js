import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Generic data-fetching hook.
 *
 * @param {Function} apiFn  – async function that returns data (from services.js)
 * @param {Array}    deps   – dependency array; a new fetch is triggered whenever deps change
 * @param {Object}   options
 * @param {boolean}  options.skip  – if true the fetch is skipped (useful when a required param is null)
 *
 * @returns {{ data, loading, error, refetch }}
 */
export default function useApi(apiFn, deps = [], { skip = false } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);

    const refetch = useCallback(async (opts) => {
        // Pass { silent: true } from a child (e.g. after a save) to keep the existing
        // data on screen while re-syncing — avoids the full-page spinner flash that
        // would otherwise unmount item cards and reset scroll/expanded state.
        const silent = opts && typeof opts === 'object' && opts.silent === true;
        if (!silent) setLoading(true);
        setError(null);
        try {
            const result = await apiFn();
            setData(result);
        } catch (err) {
            const errorMsg = err?.response?.data?.error || err.message || 'Unknown error';
            setError(errorMsg);
            // Suppress toast for auth errors (no/expired JWT) — the axios interceptor
            // already handles logout, no need to spam the login screen with toasts.
            const status = err?.response?.status;
            const isAuthError = status === 401 || !localStorage.getItem('token');
            if (!isAuthError) {
                toast.error(`Помилка: ${errorMsg}`);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (skip) {
            setData(null);
            setLoading(false);
            return;
        }
        refetch();
    }, [refetch, skip]);

    return { data, loading, error, refetch };
}
