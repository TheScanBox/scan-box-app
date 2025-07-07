import { Route, Routes } from "react-router-dom";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import React, { useEffect, Suspense } from "react";
import NotAllowed from "./pages/NotAllowed";

import { NotFound } from "./components";
import useHeartbeat from "./hooks/useHeartbeat";
import AlertMessage from "./components/AlertMessage";
import Comments from "./pages/Comments";
import PageLoading from "./components/PageLoading";

const Home = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.Home }))
);
const Profile = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.Profile }))
);
const Auth = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.Auth }))
);
const Tags = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.Tags }))
);
const More = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.More }))
);
const ScanPreview = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.ScanPreview }))
);
const ScanLecture = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.ScanLecture }))
);

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

            <Suspense fallback={<PageLoading />}>
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
            </Suspense>
        </>
    );
}

export default App;
