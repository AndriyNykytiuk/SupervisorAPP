import { useState, useEffect, useCallback } from 'react';

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

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFn();
            setData(result);
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Unknown error');
        } finally {
            setLoading(false);
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
