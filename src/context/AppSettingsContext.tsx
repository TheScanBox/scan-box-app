import api from "@/libs/api";
import { createContext, useContext, useEffect, useState } from "react";

type AppSettingsType = {
    session: {
        active: boolean;
        intervalMs: number;
    };
    [key: string]: any;

} | null;

type AppSettingsContextType = {
    settings: AppSettingsType;
    loading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<AppSettingsType>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load settings from local storage or API if needed
        const loadSettings = async () => {
            try {
                const response = await api.get("/app-settings");

                if (response.status === 200) {
                    setSettings(response.data.settings);
                }

            } catch (error) {
                console.error("Failed to load app settings:", error);
            }

            setLoading(false);
        };

        loadSettings();
    }, []);

    return (
        <AppSettingsContext.Provider value={{ settings, loading }}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);

    if (context === undefined) {
        throw new Error("useAppSettings must be used within an AppSettingsProvider");
    }

    return context;
}