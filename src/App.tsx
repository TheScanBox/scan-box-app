import { Route, Routes } from "react-router-dom";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

import { ScanPreview, Home, ScanLecture, More, Auth, Tags } from "./pages";
import NotAllowed from "./pages/NotAllowed";

import { NotFound, Profile } from "./components";
import useHeartbeat from "./hooks/useHeartbeat";
import AlertMessage from "./components/AlertMessage";
import Comments from "./pages/Comments";

type StringData = {
    name: string;
};

export type ScanResponse = {
    id: string;
    title: string;
    originalTitle: string;
    scanId: string;
    scanParentId: string;
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
            <AlertMessage />

            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="not-allowed" element={<NotAllowed />} />
                <Route path="home" element={<Home />} />
                <Route path="profile" element={<Profile />} />
                <Route path="more/:id" element={<More />} />
                <Route path="tags/:id" element={<Tags />} />
                <Route
                    path="details/:id/:parentId?"
                    element={<ScanPreview />}
                />
                <Route
                    path="read/:id/:chapter/:parentId?"
                    element={<ScanLecture />}
                />
                <Route path="comments/:id" element={<Comments />} />
                {/* <Route path="/profile/read/:id/:chapter" element={<ScanLecture />} /> */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
