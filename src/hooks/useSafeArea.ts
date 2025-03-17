import {
    viewportContentSafeAreaInsets,
    viewportSafeAreaInsets,
} from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

const useSafeArea = (): { top: number; bottom: number } => {
    const { top, bottom } = viewportSafeAreaInsets();
    const { top: contentTop, bottom: contentBottom } =
        viewportContentSafeAreaInsets();

    const [safeTop, setSafeTop] = useState(0);
    const [safeBottom, setSafeBottom] = useState(0);

    useEffect(() => {
        const safeTop = top + contentTop;
        const safeBottom = bottom + contentBottom;

        if (safeTop == 0) {
            const data = sessionStorage.getItem("safearea");

            if (!data) return;

            const safeView = JSON.parse(data || "");

            setSafeTop(parseInt(safeView.safeTop));
            setSafeBottom(parseInt(safeView.safeBottom));

            return;
        }

        sessionStorage.setItem(
            "safearea",
            JSON.stringify({
                safeTop,
                safeBottom,
            })
        );

        setSafeTop(safeTop);
        setSafeBottom(safeBottom);
    }, [top, contentTop, bottom, contentBottom]);

    return { top: safeTop, bottom: safeBottom };
};

export default useSafeArea;
