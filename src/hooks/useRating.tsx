import { useState, useEffect } from "react";
import api from "../libs/api";

const useRating = (userId: string, scanId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const { data } = await api.get(
                    `/rating?userId=${userId}&scanId=${scanId}`
                );

                setRating(data?.rating?.value);
            } catch (error) {
                console.log(error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchRating();
    }, [userId, scanId]);

    return { loading, error, rating };
};

export default useRating;
