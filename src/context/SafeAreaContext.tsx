import { viewportContentSafeAreaInsets, viewportSafeAreaInsets } from "@telegram-apps/sdk-react";
import React, { createContext, useContext, useEffect, useState } from "react";

type SafeAreaContextType = {
    top: number;
    bottom: number;
};

const SafeAreaContext = createContext<SafeAreaContextType>({ top: 0, bottom: 0 });

export const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => {
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

    return (
        <SafeAreaContext.Provider value={{ top: safeTop, bottom: safeBottom }}>
            {children}
        </SafeAreaContext.Provider>
    );
};

export const useSafeArea = () => {
    const context = useContext(SafeAreaContext);

    if (!context) throw new Error("useSafeArea must be used within SafeAreaProvider");

    return context;
};