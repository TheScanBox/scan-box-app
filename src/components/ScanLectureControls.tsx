import { IoIosArrowForward, IoMdShareAlt, IoMdSunny } from "react-icons/io";
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { useSafeArea } from "@/context/SafeAreaContext";
import { retrieveLaunchParams, shareURL, isFullscreen, mountViewport, requestFullscreen, exitFullscreen } from "@telegram-apps/sdk-react";
import { capitalize } from "../pages/ScanPreview";
import { useAlert } from "../context/AlertContext";
import { useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

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
    const { showAlert } = useAlert();
    const { tgWebAppPlatform } = retrieveLaunchParams();
    const [isFullscreenMode, setIsFullscreenMode] = useState(isFullscreen());

    const handleCopy = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;
        shareURL(`${APP_URL}?startapp=read_${scanID}_${selectedChap}`, `\nLisez le Chapitre ${selectedChapName} de **${capitalize(title)}** !`)
    };

    const isNotMobile = useMemo(() => {
        return tgWebAppPlatform !== "ios" && tgWebAppPlatform !== "android";
    }, [tgWebAppPlatform]);

    const handleFullscreen = async () => {
        if (!isFullscreen()) {
            await mountViewport();
            if (requestFullscreen.isAvailable() && !isFullscreen()) {
                try {
                    await requestFullscreen();
                } catch (error) {
                    alert(JSON.stringify(error));
                }
            }

            localStorage.setItem("lectureFullscreen", "true");

            setIsFullscreenMode(true);
            return;
        }

        await exitFullscreen();
        localStorage.setItem("lectureFullscreen", "false");
        setIsFullscreenMode(false);
    };

    return (
        <div
            className={`${showControls ? "show-controls" : "hidden"
                } w-full text-white font-light select-none fixed bg-black/90 p-3 z-30 flex items-center justify-between md:max-w-[700px]`}
            style={{
                paddingTop: top ? (showAlert ? 10 : top) : "1rem",
            }}
        >
            <div
                className="flex items-center w-full font-semibold"

            >
                <p className="truncate max-w-36 capitalize">{title}</p>
                <IoIosArrowForward size={20} />
                <p className="truncate max-w-28">Chapitre {selectedChapName}</p>
            </div>

            <div className="flex flex-row items-center gap-3">
                {isNotMobile && (
                    <button
                        title={isFullscreenMode ? "Quitter le mode plein écran" : "Passer en plein écran"}
                        className="cursor-pointer"
                        onClick={handleFullscreen}
                    >
                        {isFullscreenMode ? (<BiExitFullscreen size={23} />) : (<BiFullscreen size={23} />)}
                    </button>
                )}

                <button
                    title="Modifier la luminosité"
                    className="cursor-pointer"
                    onClick={() => setShowLightConfig((prev) => !prev)}
                >
                    <IoMdSunny size={23} />
                </button>

                <button
                    title="Partager le chapitre"
                    className="cursor-pointer"
                    onClick={handleCopy}
                >
                    <IoMdShareAlt size={24} />
                </button>
            </div>
        </div>
    );
}

export default ScanLectureControls;
