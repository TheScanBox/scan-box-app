import { useSafeArea } from "@/context/SafeAreaContext";
import { IoClose } from "react-icons/io5"
import { IoMdShareAlt } from "react-icons/io";
import { shareURL } from "@telegram-apps/sdk-react";
import { capitalize } from "@/pages/ScanPreview";

type TrailerViewProps = {
    videoUrl: string;
    scanId: string;
    title: string
    handleClose: () => void;
};

const TrailerView = ({ videoUrl, scanId, title, handleClose }: TrailerViewProps) => {
    const { top, bottom } = useSafeArea();

    const handleShare = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;
        shareURL(`${APP_URL}?startapp=trailer_${scanId}`, `\nRegardez la bande-annonce de ${capitalize(title)} sur ScanBox !`);
    }

    return (
        <div
            style={{ paddingTop: top ? top : 16, paddingBottom: bottom ? bottom : 16 }}
            className="fixed top-0 left-0 w-full h-full bg-black/80 z-50">
            <div className=" flex flex-col items-center justify-center gap-8 h-full max-h-[80vh]">
                <div className="relative w-full h-full max-w-3xl max-h-[50vh]">
                    <iframe
                        className="w-full h-full"
                        src={videoUrl}
                        title={`Trailer de ${title}`}
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <div
                    style={{ top: top ? top + 16 : 32 }}
                    className="absolute right-4 flex justify-end gap-3 items-center"
                >

                    <button
                        onClick={handleShare}
                        className=" bg-black/70 hover:bg-black/50 transition-colors p-2 rounded-full cursor-pointer"
                    >
                        <IoMdShareAlt className="text-white" size={28} />
                    </button>
                    <button
                        onClick={handleClose}
                        className=" bg-black/70 hover:bg-black/50 transition-colors p-2 rounded-full cursor-pointer"
                    >
                        <IoClose className="text-white" size={28} />
                    </button>
                </div>

            </div>
        </div>
    )
}

export default TrailerView