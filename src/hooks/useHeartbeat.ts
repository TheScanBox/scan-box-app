import { useEffect, useRef } from "react";
import api from "../libs/api";
import { on } from "@telegram-apps/sdk-react";

const useHeartbeat = (userId: string, intervalMs: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isActive = useRef(true);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const sendHeartbeat = async () => {
            if (!isActive.current) return;

            try {
                await api.post("/heartbeat", {
                    userId,
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.error("Heartbeat failed:", error);
            }

            if (isActive.current) {
                timeoutRef.current = setTimeout(sendHeartbeat, intervalMs); // wait 30s
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
    }, [userId]);
};

export default useHeartbeat;
