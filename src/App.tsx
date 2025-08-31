import { Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";
import NotAllowed from "./pages/NotAllowed";

import { NotFound } from "./components";
import useHeartbeat from "./hooks/useHeartbeat";
import AlertMessage from "./components/AlertMessage";
import PageLoading from "./components/PageLoading";
import { SafeAreaProvider } from "./context/SafeAreaContext";
import { useRequestFullscreen } from "./hooks/useRequestFullscreen";
import { useDisableContextMenu } from "./hooks/useDisableContextMenu";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";

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
const Comments = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.Comments }))
);
const User = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.User }))
);
const Settings = React.lazy(() =>
    import("./pages").then((m) => ({ default: m.Settings }))
);

const Scans = React.lazy(() =>
    import("./pages/tabs").then((m) => ({ default: m.Scans }))
);

const ProfileComments = React.lazy(() =>
    import("./pages/tabs").then((m) => ({ default: m.Comments }))
);

const Subscriptions = React.lazy(() =>
    import("./pages/tabs").then((m) => ({ default: m.Subscriptions }))
);

const CommentSearch = React.lazy(() =>
    import("./pages/search").then((m) => ({ default: m.CommentSearch }))
);

const ScanSearch = React.lazy(() =>
    import("./pages/search").then((m) => ({ default: m.ScanSearch }))
);

const SubscriptionSearch = React.lazy(() =>
    import("./pages/search").then((m) => ({ default: m.SubscriptionSearch }))
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
    status: string;
    latestChapter: number | null;
    releasedYear: number | null;
    videoUrl: string | null;

    createdAt: Date;
    updatedAt: Date;
};

// const intervalMs = 300000;
const intervalMs = 60000;

function App() {
    const { tgWebAppData } = retrieveLaunchParams();

    const { hasMountedViewport } = useRequestFullscreen();
    useHeartbeat(tgWebAppData?.user?.id?.toString() || "", intervalMs);
    useDisableContextMenu();

    if (!hasMountedViewport) {
        return (
            <PageLoading />
        );
    }

    return (
        <SafeAreaProvider>
            <AlertMessage />
            <Suspense fallback={<PageLoading />}>
                <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="not-allowed" element={<NotAllowed />} />
                    <Route path="home" element={<Home />} />
                    <Route path="profile" element={<Profile />}>
                        <Route index element={<Scans />} />
                        <Route path="comments" element={<ProfileComments />} />
                        <Route path="subscriptions" element={<Subscriptions />} />
                    </Route>

                    <Route path="search">
                        <Route index element={<NotFound />} />
                        <Route path="scans" element={<ScanSearch />} />
                        <Route path="comments" element={<CommentSearch />} />
                        <Route path="subscriptions" element={<SubscriptionSearch />} />
                    </Route>

                    <Route path="user/:refId" element={<User />} />
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
                    <Route path="comments/:scanId/:chapterNumber" element={<Comments />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </SafeAreaProvider>
    );
}

export default App;
