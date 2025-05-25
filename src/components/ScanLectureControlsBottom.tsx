import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import useSafeArea from "../hooks/useSafeArea";
import { isFullscreen } from "@telegram-apps/sdk-react";
import ScrollToTop from "./ScrollToTop";

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
    const { bottom } = useSafeArea();

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
            } w-full items-center justify-between text-white font-light fixed bottom-0 bg-black/90 p-3 z-30`}
        >
            <ScrollToTop visible={visible} handleScroll={handleScroll} />
            <p className="text-[10px] text-slate-400">
                Tapez 2 fois pour afficher.
            </p>
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
