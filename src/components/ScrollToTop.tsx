import { useState, useEffect } from "react";
import { useSafeArea } from "@/context/SafeAreaContext";
import { FaArrowUp } from "react-icons/fa";

const ScrollToTop = ({
    visible,
    handleScroll,
}: {
    visible: boolean;
    handleScroll: () => void;
}) => {
    const { bottom } = useSafeArea();

    return (
        visible && (
            <button
                style={{
                    marginBottom: bottom ? bottom + 75 : "8rem",
                }}
                className="absolute right-4 px-4 py-4 bg-black/90 rounded-full text-white flex justify-center items-center cursor-pointer"
                onClick={handleScroll}
            >
                <FaArrowUp size={18} />
            </button>
        )
    );
};
export default ScrollToTop;
