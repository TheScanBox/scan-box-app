import { useState, useEffect } from "react";

const useLocalStorage = <T>(key: string, initialValue: T) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? (JSON.parse(stored) as T) : initialValue;
        } catch (err) {
            console.error("Error reading localStorage key:", key);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error("Error writing to localStorage key:", key);
        }
    }, [key, value]);

    return [value, setValue] as const;
};
export default useLocalStorage;
