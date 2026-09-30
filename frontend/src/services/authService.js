const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, payload) {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        });
    } catch {
        throw new Error("Unable to reach the server. Please check your connection and try again.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
    return data;
}

export const login = (payload) => request("/auth/login", payload);
export const signup = (payload) => request("/auth/signup", payload);