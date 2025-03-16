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
            if (
                window.history.length <= 2 &&
                location.pathname.includes("details")
            ) {
                navigate("/home");

                return;
            }

            navigate(-1);
        });
    }, []);

    return <>{children}</>;
}
