import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export default function useFetch(urlOrPath) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(Boolean(urlOrPath));
    const [error, setError] = useState("");

    useEffect(() => {
        if (!urlOrPath) return;

        let isMounted = true;
        setLoading(true);

        apiFetch(urlOrPath)
            .then((result) => {
                if (!isMounted) return;
                setData(result?.data !== undefined ? result.data : result);
                setError("");
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err.message || "Network error");
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [urlOrPath]);

    return {
        data,
        loading: urlOrPath ? loading : false,
        error
    };
}
