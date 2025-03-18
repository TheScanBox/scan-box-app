import { IoIosArrowForward, IoMdPhonePortrait } from "react-icons/io";
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

    // const fullScreen = async () => {
    //     if (!isFullscreen()) {
    //         await mountViewport();
    //         if (requestFullscreen.isAvailable() && !isFullscreen()) {
    //             try {
    //                 await requestFullscreen();
    //             } catch (error) {
    //                 alert(JSON.stringify(error));
    //             }
    //         }

    //         return;
    //     }

    //     await exitFullscreen();
    // };

    return (
        <div
            className={`${
                showControls ? "show-controls" : "hidden"
            } w-full text-white font-light fixed bg-black/90 p-2 z-30`}
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
