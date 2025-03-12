import { useState, useCallback } from "react";
import { getAuth } from "firebase/auth";

const useAPI = <T,>() => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const callApi = useCallback(async (endpoint: string, method: string = "GET", body: any = null, headers: any = {}, requireAuth: boolean = true) => {
        setLoading(true);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
            let requestHeaders: Record<string, string> = {
                "Content-Type": "application/json",
                ...headers,
            };

            // ✅ Only attach Firebase Auth Token if required
            if (requireAuth) {
                const auth = getAuth();
                const user = auth.currentUser;

                if (user) {
                    const idToken = await user.getIdToken(); // 🔹 Retrieve Token
                    requestHeaders["Authorization"] = `Bearer ${idToken}`;
                } else {
                    console.warn("User not authenticated, skipping token");
                }
            }

            const options: RequestInit = {
                method,
                headers: requestHeaders,
            };

            if (method !== "GET" && body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_URL}/${endpoint}`, options);
            const responseData = await response.json();

            if (!response.ok) {
                console.error("API Error:", responseData);
                setError(responseData.message || "An error occurred.");
                return { success: false, error: responseData.message || "An error occurred." };
            }

            setData(responseData);
            return { success: true, data: responseData };
        } catch (err: any) {
            console.error("API Fetch Error:", err);
            setError(err.message || "An unexpected error occurred.");
            return { success: false, error: err.message || "An unexpected error occurred." };
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, callApi };
};

export default useAPI;
