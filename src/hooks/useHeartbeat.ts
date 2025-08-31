import { useEffect, useRef } from "react";
import api from "../libs/api";
import { on, closeMiniApp, openPopup } from "@telegram-apps/sdk-react";
import { HeartbeatResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";

const useHeartbeat = (userId: string, intervalMs: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isActive = useRef(true);
    const hasStarted = useRef(false);
    const { isAuthenticated } = useAuth();
    const { settings } = useAppSettings();

    useEffect(() => {
        // if (import.meta.env.VITE_APP_ENV == "development") return;
        if (settings?.session?.active === false) return;
        if (hasStarted.current) return;
        if (!isAuthenticated) return;
        if (!userId) return;

        hasStarted.current = true;

        const sendHeartbeat = async () => {
            if (!isActive.current) return;

            try {
                const res = await api.post<HeartbeatResponse>("/session/heartbeat");

                if (res.status !== 200) {
                    throw new Error("Failed to send heartbeat");
                }

                if (res.data.timeout) {
                    await openPopup({
                        title: "Session Timeout",
                        message: "Session timed out. Closing mini app.",
                        buttons: [{ type: "ok" }],
                    });

                    if (closeMiniApp.isAvailable()) {
                        closeMiniApp();
                    }
                }

            } catch (error) {
                console.error("Heartbeat failed:", error);
            }

            if (isActive.current) {
                timeoutRef.current = setTimeout(sendHeartbeat, settings?.session?.intervalMs || intervalMs);
            }
        };

        sendHeartbeat();

        const handleVisibilityChange = ({
            is_visible,
        }: {
            is_visible: boolean;
        }) => {
            if (!is_visible) {
                isActive.current = false;
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            } else {
                isActive.current = true;
                sendHeartbeat();
            }
        };

        on("visibility_changed", handleVisibilityChange);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            console.log("clear");
        };
    }, [userId, settings, isAuthenticated]);
};

export default useHeartbeat;
