import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";
import useSafeArea from "../hooks/useSafeArea";
import ScrollToTop from "./ScrollToTop";
import { useState } from "react";

import { hapticFeedback } from "@telegram-apps/sdk";
import { useNavigate } from "react-router-dom";

type ScanLectureControlsBottomProps = {
    numChap: number;
    showControls: boolean;
    setSelectedChap: React.Dispatch<React.SetStateAction<string>>;
    selectedChap: string;
    visible: boolean;
    handleScroll: () => void;
};

const ScanLectureControlsBottom = ({
    numChap,
    showControls,
    setSelectedChap,
    selectedChap,
    visible,
    handleScroll,
}: ScanLectureControlsBottomProps) => {
    const navigate = useNavigate();
    const { bottom } = useSafeArea();
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = () => {
        if (hapticFeedback.impactOccurred.isAvailable()) {
            // hapticFeedback.selectionChanged();
            hapticFeedback.impactOccurred("medium");
        }

        setIsLiked((prev) => !prev);
    };

    const handleNavigate = (delta: number) => {
        const newSelectedChap = Number(selectedChap) + delta;

        if (newSelectedChap <= 0) {
            setSelectedChap("1");
            return;
        }

        if (newSelectedChap > numChap) {
            setSelectedChap(String(numChap));
            return;
        }

        setSelectedChap(newSelectedChap.toString());
    };

    return (
        <div
            style={{
                paddingBottom: bottom ? bottom : "1rem",
            }}
            className={`${
                showControls ? "show-controls" : "hidden"
            } w-full items-center justify-end text-white font-light fixed bottom-0 bg-black/90 p-3 z-30`}
        >
            <ScrollToTop visible={visible} handleScroll={handleScroll} />
            <p className="text-[10px] text-slate-400 hidden">
                Tapez 2 fois pour afficher.
            </p>

            <div className="gap-4 items-center hidden">
                <div className="flex gap-1 items-center">
                    <FaHeart
                        size={26}
                        className={`${
                            isLiked ? "text-red-600" : "text-white"
                        } cursor-pointer`}
                        onClick={handleLike}
                    />

                    <span className="text-xs">1.2k</span>
                </div>

                <div className="flex gap-1 items-center">
                    <BiCommentDetail
                        size={26}
                        className="text-slate-400 cursor-pointer"
                        // onClick={() =>
                        //     alert("⚠ Comments are currently unavailable.")
                        // }
                        onClick={() => navigate("../../../comments/test")}
                    />
                    <span className="text-xs">102</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    className="outline-none"
                    disabled={Number(selectedChap) == 1}
                    onClick={() => handleNavigate(-1)}
                >
                    <IoIosArrowDropleft size={28} />
                </button>
                <button
                    className="outline-none"
                    disabled={Number(selectedChap) == numChap}
                    onClick={() => handleNavigate(1)}
                >
                    <IoIosArrowDropright size={28} />
                </button>
            </div>
        </div>
    );
};

export default ScanLectureControlsBottom;
