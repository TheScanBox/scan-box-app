import { backButton, init } from "@telegram-apps/sdk-react";
import { PropsWithChildren, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

export function Page({
    children,
    back = true,
}: PropsWithChildren<{
    /**
     * True if it is allowed to go back from this page.
     * @default true
     */
    back?: boolean;
}>) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        init();
        backButton.mount();

        if (back) {
            backButton.show();
        } else {
            backButton.hide();
        }
    }, [back]);

    useEffect(() => {
        return backButton.onClick(() => {
            if (location.pathname.includes("/search")) {
                navigate(-1);
                return;
            }

            if (location.pathname.includes("/profile")) {
                navigate("/home", { replace: true });
                return;
            }

            if (location.pathname.includes("/comments") && location.search.includes("?source=auth")) {
                navigate("/home", {
                    replace: true
                })

                return;
            }

            if (location.pathname.includes("/comments") && !location.search.includes("?source=profile")) {
                const { scanId, chapterNumber, parentId, currentState } = location.state || {};

                const path = parentId
                    ? `/read/${scanId}/${chapterNumber}/${parentId}`
                    : `/read/${scanId}/${chapterNumber}`;

                navigate(path, {
                    state: currentState,
                    replace: true,
                });

                return
            }

            if (location.search.includes("?source=user")) {
                navigate(-1);
                return;
            }

            if (location.search.includes("?source=auth")) {
                if (location.pathname.includes("read") && location.state.data) {
                    const { scanId, scanParentId } = location.state.data;

                    const path = scanParentId
                        ? `../details/${scanId}/${scanParentId}?source=auth`
                        : `../details/${scanId}?source=auth`;

                    navigate(path, { replace: true });

                    return;
                }

                navigate("/home", { replace: true });
                return;
            }

            if (window.history.length <= 2) {
                navigate("/home", { replace: true });
                return;
            }

            navigate(-1);
        });
    }, []);

    return <>{children}</>;
}
