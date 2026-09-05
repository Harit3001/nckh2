import { useState } from "react";
import { apiFetch } from "../services/api";

export default function usePost() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function postData(urlOrPath, body, method = "POST") {
        setLoading(true);
        setError("");

        try {
            const result = await apiFetch(urlOrPath, {
                method,
                body: body ? JSON.stringify(body) : undefined,
            });

            return result;
        } catch (err) {
            setError(err.message || "Network error");
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return {
        postData,
        loading,
        error,
    };
}
