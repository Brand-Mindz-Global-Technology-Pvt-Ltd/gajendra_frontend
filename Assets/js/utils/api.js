/**
 * Generic API Fetch Wrapper
 * Handles headers, credentials, and error parsing.
 */
export async function apiCall(url, method = "GET", body = null) {
    const options = {
        method,
        headers: {},
        credentials: "include", // Important for sessions/cookies
    };

    if (body) {
        if (body instanceof FormData) {
            // FormData automatically sets the Content-Type to multipart/form-data
            options.body = body;
        } else {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }
    }

    // TOKEN AUTH FALLBACK: Inject session ID as Bearer token
    const token = localStorage.getItem("authToken");
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data; // Expecting { success: boolean, message: string, ... }
    } catch (error) {
        console.error("API Error:", error);
        return { success: false, message: "Network error or server unreachable." };
    }
}
