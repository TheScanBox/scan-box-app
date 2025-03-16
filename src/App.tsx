import { Route, Routes } from "react-router-dom";
import { NotFound, Profile } from "./components";
import { useEffect } from "react";

import { ScanPreview, Home, ScanLecture, More } from "./pages";
import Auth from "./pages/Auth";
import NotAllowed from "./pages/NotAllowed";

type StringData = {
    name: string;
};

export type ScanResponse = {
    id: string;
    title: string;
    originalTitle: string;
    scanId: string;
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

function App() {
    useEffect(() => {
        const disableContextMenu = (e: MouseEvent) => e.preventDefault();
        document.addEventListener("contextmenu", disableContextMenu);

        return () => {
            document.removeEventListener("contextmenu", disableContextMenu);
        };
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="not-allowed" element={<NotAllowed />} />
            <Route path="home" element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="more/:id" element={<More />} />
            <Route path="details/:id" element={<ScanPreview />} />
            <Route path="read/:id/:chapter" element={<ScanLecture />} />
            {/* <Route path="/profile/read/:id/:chapter" element={<ScanLecture />} /> */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
