import { isFullscreen, isViewportMounted, isViewportMounting, mountViewport, requestFullscreen, retrieveLaunchParams, setMiniAppBackgroundColor, setMiniAppHeaderColor } from '@telegram-apps/sdk-react';
import { useEffect, useRef, useState } from 'react'

export const useRequestFullscreen = () => {
    const hasMounted = useRef(false);
    const [hasMountedViewport, setHasMountedViewport] = useState(false);

    const mount = async () => {
        if (
            mountViewport.isAvailable() &&
            !isViewportMounted() &&
            !isViewportMounting()
        ) {
            if (!hasMounted.current) {
                hasMounted.current = true;
                await mountViewport();

                const { tgWebAppPlatform } = retrieveLaunchParams();

                if (
                    tgWebAppPlatform != "android" &&
                    tgWebAppPlatform != "ios"
                ) {
                    return;
                }

                setMiniAppHeaderColor.ifAvailable("#0f172a");
                setMiniAppBackgroundColor.ifAvailable("#0f172a");

                if (requestFullscreen.isAvailable() && !isFullscreen()) {
                    try {
                        await requestFullscreen();
                    } catch (error) {
                        alert(JSON.stringify(error));
                    }
                }
            }
        }
    };

    useEffect(() => {
        const init = async () => {
            if (
                mountViewport.isAvailable() &&
                !isViewportMounted() &&
                !isViewportMounting()
            ) {
                await mount();
                setHasMountedViewport(true);
            }
        }

        init();

    }, []);

    return { hasMountedViewport };
}
