// services/api.ts
import { auth } from './firebase';

const API_BASE = 'http://localhost:8020'; // The Node.js router

// This is a cache for the CSRF token so we don't have to fetch it every time.
let csrfToken: string | null = null;

/**
 * Fetches the CSRF token from the backend.
 * Caches the token to avoid refetching on subsequent calls.
 */
const getCsrfToken = async (): Promise<string | null> => {    
    if (csrfToken) {
        return csrfToken;
    }
    try {
        const response = await fetch(`${API_BASE}/api/csrf-token`);
        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }
        const data = await response.json();
        csrfToken = data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('CSRF token fetch error:', error);
        // Clear the cached token in case of an error
        csrfToken = null; 
        return null;
    }
};

/**
 * A wrapper around the native `fetch` function that automatically handles:
 * 1. Prepending the API base URL.
 * 2. Including credentials (cookies) for all requests.
 * 3. Fetching and attaching a CSRF token for all state-changing methods (POST, PUT, DELETE, etc.).
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const url = `${API_BASE}${endpoint}`;

    // Ensure credentials are included for cookies (and CSRF)
    options.credentials = 'include';
    
    const method = options.method?.toUpperCase() || 'GET';
    const isStateChangingMethod = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (isStateChangingMethod) {
        const token = await getCsrfToken();
        if (token) {
            options.headers = {
                ...options.headers,
                'X-CSRF-Token': token,
            };
        } else {
            // If we can't get a token, we should probably fail the request
            // to avoid making an unauthenticated state-changing request.
            return Promise.reject(new Error('Could not retrieve CSRF token. Request blocked.'));
        }
    }
    
    return fetch(url, options);
};

// We can also export the token fetcher in case we need to "prime" it on app load.
export { getCsrfToken };
