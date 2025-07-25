import { useEffect } from "react";


export const useDisableContextMenu = () => {
    useEffect(() => {
        const disableContextMenu = (e: MouseEvent) => e.preventDefault();
        document.addEventListener("contextmenu", disableContextMenu);

        return () => {
            document.removeEventListener("contextmenu", disableContextMenu);
        };
    }, []);
}
