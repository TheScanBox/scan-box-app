import { IoIosArrowForward, IoMdShareAlt, IoMdSunny } from "react-icons/io";
import useSafeArea from "../hooks/useSafeArea";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { capitalize } from "../pages/ScanPreview";
import { useAlert } from "../context/AlertContext";

type ScanLectureControlsProps = {
    numChap: number;
    setSelectedChap: React.Dispatch<React.SetStateAction<string>>;
    selectedChap: string;
    selectedChapName: string;
    scanID: string | undefined;
    showControls: boolean;
    title: string;
    setShowLightConfig: React.Dispatch<React.SetStateAction<boolean>>;
};

function ScanLectureControls({
    selectedChap,
    showControls,
    title,
    scanID,
    selectedChapName,
    setShowLightConfig,
}: ScanLectureControlsProps) {
    const { top } = useSafeArea();
    const { unavailable } = useAlert();

    const handleCopy = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;

        openTelegramLink(
            `https://t.me/share/url?text=${encodeURIComponent(
                `Lisez le Chapitre ${selectedChapName} de **${capitalize(
                    title
                )}** !\n\n${`${APP_URL}?startapp=read_${scanID}_${selectedChap}`}`
            )}`
        );
    };

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
            } w-full text-white font-light fixed bg-black/90 p-3 z-30`}
            style={{
                paddingTop: top ? (unavailable ? 10 : top) : "1rem",
            }}
        >
            <div
                className="flex items-center w-full font-semibold"
                // style={{
                //     paddingTop: unavailable ? 10 : 0,
                // }}
            >
                <p className="truncate max-w-36 capitalize">{title}</p>
                <IoIosArrowForward size={20} />
                <p>Chapitre {selectedChapName}</p>
            </div>
            <div className="flex flex-row items-center gap-4">
                <button
                    className="cursor-pointer"
                    onClick={() => setShowLightConfig((prev) => !prev)}
                >
                    <IoMdSunny size={23} />
                </button>
                <button className="cursor-pointer" onClick={handleCopy}>
                    <IoMdShareAlt size={24} />
                </button>
            </div>
        </div>
    );
}

export default ScanLectureControls;
