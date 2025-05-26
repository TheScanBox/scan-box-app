import { Route, Routes } from "react-router-dom";
import { NotFound, Profile } from "./components";
import { useEffect } from "react";

import { ScanPreview, Home, ScanLecture, More } from "./pages";
import Auth from "./pages/Auth";
import NotAllowed from "./pages/NotAllowed";
import useSafeArea from "./hooks/useSafeArea";
import { useAlert } from "./context/AlertContext";
import { IoMdClose } from "react-icons/io";
import { on, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import useHeartbeat from "./hooks/useHeartbeat";

type StringData = {
    name: string;
};

export type ScanResponse = {
    id: string;
    title: string;
    originalTitle: string;
    scanId: string;
    scanSubId: string;
    scanPath: string;
    description: string;
    stars: number;
    views: number;
    imgUrl: string;
    continuation: string;
    type: "Mange" | "Webtoon";
    author: StringData;
    tags: StringData[];
    specialChapters: { chap: number }[];

    createdAt: Date;
    updatedAt: Date;
};

const intervalMs = 60000;

function App() {
    const { top } = useSafeArea();
    const { unavailable, setUnAvailable } = useAlert();

    const { tgWebAppData } = retrieveLaunchParams();

    useHeartbeat(tgWebAppData?.user?.id?.toString() || "", intervalMs);

    useEffect(() => {
        const disableContextMenu = (e: MouseEvent) => e.preventDefault();
        document.addEventListener("contextmenu", disableContextMenu);

        return () => {
            document.removeEventListener("contextmenu", disableContextMenu);
        };
    }, []);

    return (
        <>
            {unavailable && (
                <div
                    className="w-full py-1 bg-red-500 text-white text-center text-xs z-50 flex flex-row justify-between items-center px-3"
                    style={{
                        paddingTop: top,
                    }}
                >
                    <div>
                        Les scan sont indisponible pour le moment. Reessaye plus
                        tard
                    </div>
                    <div
                        className="cursor-pointer min-w-5"
                        onClick={() => setUnAvailable(false)}
                    >
                        <IoMdClose size={16} />
                    </div>
                </div>
            )}

            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="not-allowed" element={<NotAllowed />} />
                <Route path="home" element={<Home />} />
                <Route path="profile" element={<Profile />} />
                <Route path="more/:id" element={<More />} />
                <Route path="details/:id/:subid?" element={<ScanPreview />} />
                <Route path="read/:id/:chapter" element={<ScanLecture />} />
                {/* <Route path="/profile/read/:id/:chapter" element={<ScanLecture />} /> */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
