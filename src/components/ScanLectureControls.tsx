import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import WebApp from "@twa-dev/sdk";
import { IoIosArrowForward } from "react-icons/io";
import useSafeArea from "../hooks/useSafeArea";
import { isFullscreen } from "@telegram-apps/sdk-react";

type ScanLectureControlsProps = {
    numChap: number;
    setSelectedChap: React.Dispatch<React.SetStateAction<string>>;
    selectedChap: string;
    scanID: string | undefined;
    showControls: boolean;
    title: string;
};

function ScanLectureControls({
    selectedChap,
    showControls,
    title,
}: ScanLectureControlsProps) {
    const { top } = useSafeArea();

    return (
        <div
            className={`${
                showControls ? "show-controls" : "hidden"
            } w-full text-white font-light fixed z-10 bg-black/90 p-2`}
            style={{
                paddingTop: isFullscreen() ? top : "1rem",
            }}
        >
            <div className="flex items-center w-full font-semibold">
                <p className="truncate max-w-36 capitalize">{title}</p>
                <IoIosArrowForward size={24} />
                <p>Chapitre {selectedChap}</p>
            </div>
        </div>
    );
}

export default ScanLectureControls;
