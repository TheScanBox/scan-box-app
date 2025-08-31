import { useEffect, useState } from "react";
import {
    Banner,
    CardsContainer,
    Footer,
    SearchBar,
    SearchScreen,
    HomeLoading,
} from "../components";

import { ScanResponse } from "../App";
import { IoIosArrowForward } from "react-icons/io";
import { Page } from "../components/Page";
import { useQuery } from "@tanstack/react-query";
import api from "../libs/api";
import { debounce } from "lodash";
import { useAlert } from "../context/AlertContext";
import { useSafeArea } from "@/context/SafeAreaContext";
import { cloudStorage } from "@telegram-apps/sdk-react";
import useUser from "@/hooks/useUser";

function Home() {
    const [search, setSearch] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const { top, bottom } = useSafeArea();
    const { showAlert } = useAlert();
    const user = useUser();

    const debouncedSearch = debounce((query) => {
        setDebouncedSearchTerm(query);
    }, 800);

    const handleSearch = (searchText: string) => {
        setSearch(searchText);
        debouncedSearch(searchText);
    };

    const fetchData = async (key: string) => {
        const { data, status } = await api.get(`/scans?key=${key}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data.data;
    };


    const {
        data: recentData,
        error: recentErr,
        isLoading: recentLoading,
        refetch,
    } = useQuery<ScanResponse[]>({
        queryKey: ["recent_data"],
        queryFn: () => fetchData("recent"),
        staleTime: 300000,
    });


    const {
        data: mangaData,
        error: managError,
        isLoading: mangaLoading,
    } = useQuery<ScanResponse[]>({
        queryKey: ["manga_data"],
        queryFn: () => fetchData("manga"),
        staleTime: 300000
    });
    const {
        data: webtoonData,
        error: webtoonErr,
        isLoading: webtoonLoading,
    } = useQuery<ScanResponse[]>({
        queryKey: ["web_dataa"],
        queryFn: () => fetchData("webtoon"),
        staleTime: 300000,
    });

    useEffect(() => {
        const updateUserScan = async () => {
            const updateCompleted = await cloudStorage.getItem("updateCompleted") as unknown as { updateCompleted: string } | null;
            const parseUpdateCompleted = updateCompleted ? JSON.parse(updateCompleted.updateCompleted) : false;

            if (parseUpdateCompleted) {
                console.log("Update already completed, skipping.");
                return;
            }

            try {
                const recent = await cloudStorage.getItem("recents") as unknown as { recents: string } | null;
                const favourites = await cloudStorage.getItem("favourites") as unknown as { favourites: string } | null;
                const bookmarks = await cloudStorage.getItem("bookmarks") as unknown as { bookmarks: string } | null;

                const parsedRecents = recent ? JSON.parse(recent.recents) : [];
                const parsedFavourites = favourites ? JSON.parse(favourites.favourites) : [];
                const parsedBookmarks = bookmarks ? JSON.parse(bookmarks.bookmarks) : [];

                const userId = user?.id.toString() || "";

                if (!userId) {
                    console.log("User ID not found, cannot update scans.");
                    return;
                }

                console.log("Parsed Recents:", parsedRecents);

                const recentScanPromises = parsedRecents.map((item: any) => {
                    return api.post('/readscan', {
                        userId: userId,
                        scanId: item.scanId,
                        chapterNumber: Number(item.chap),
                        chapterName: item.chapName,
                    });
                });

                const favouriteScanPromises = parsedFavourites.map((item: any) => {
                    return api.post('/favorite', {
                        userId: userId,
                        scanId: item.scanId,
                    });
                });

                const bookmarkScanPromises = parsedBookmarks.map((item: any) => {
                    return api.post('/bookmark', {
                        userId: userId,
                        scanId: item.scanId,
                    });
                });

                await Promise.all([
                    ...recentScanPromises,
                    ...favouriteScanPromises,
                    ...bookmarkScanPromises
                ]);

                await cloudStorage.setItem("updateCompleted", JSON.stringify(true));

                console.log("User scans updated successfully");
            } catch (error) {
                console.error("Error fetching user scan:", error);
            }
        };

        updateUserScan();
    }, [user]);

    if (recentLoading) {
        return <HomeLoading />;
    }

    if ((recentErr || !recentData) && !recentLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl capitalize">
                    An unknown error occured
                </h1>
                <button
                    className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm"
                    onClick={() => refetch()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <Page back={false}>
            {/* <AlertMessage /> */}
            <section
                className="relative md:max-w-[700px] mx-auto"
                style={{
                    marginTop: showAlert ? 0 : top,
                    marginBottom: bottom,
                }}
            >
                <section className="px-3 pt-3 h-full">
                    <SearchBar
                        search={search}
                        handleSearch={handleSearch}
                        setSearch={setSearch}
                    />
                    {search ? (
                        <SearchScreen
                            debouncedSearchText={debouncedSearchTerm}
                        />
                    ) : (
                        <>
                            {recentLoading ? (
                                <div className="w-full h-48 mt-4 rounded-lg relative animate-pulse  bg-slate-700">
                                    <div className="absolute bottom-0 p-2 text-white w-full flex justify-between items-center">
                                        <div className="w-full space-y-2">
                                            <div className="h-2 w-6/12  bg-slate-800 rounded" />
                                            <div className="h-2 w-1/3 bg-slate-800 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Banner
                                    data={
                                        [...(recentData || [])]
                                            ?.sort(
                                                () =>
                                                    Math.random() -
                                                    Math.random()
                                            )
                                            .slice(0, 5) || []
                                    }
                                />
                            )}

                            <CardsContainer
                                title="Récemment Ajouté"
                                id={"recent"}
                                data={recentData}
                                loading={recentLoading}
                                error={recentErr}
                            />

                            <div className="w-full flex-col hidden my-4">
                                <h1 className="text-white mb-1 text-lg flex justify-between">
                                    <span>Genres</span>
                                    <div className="flex items-center gap-1 text-slate-400 cursor-pointer">
                                        <span className="text-xs">
                                            Voir Plus
                                        </span>
                                        <IoIosArrowForward className="font-bold text-xs" />
                                    </div>
                                </h1>
                                <div className="w-full grid grid-cols-2 gap-2 text-white text-sm">
                                    <div className="p-1 flex items-center justify-center bg-slate-500 rounded-md">
                                        Sport
                                    </div>
                                    <div className="p-1 flex items-center justify-center bg-slate-500 rounded-md">
                                        Shonene
                                    </div>
                                    <div className="p-1 flex items-center justify-center bg-slate-500 rounded-md">
                                        xXfsf
                                    </div>
                                    <div className="p-1 flex items-center justify-center bg-slate-500 rounded-md">
                                        dsfsff
                                    </div>
                                    <div className="p-1 flex items-center justify-center bg-slate-500 rounded-md">
                                        xXfsf
                                    </div>
                                    <div className="p-1 flex items-center justify-center bg-slate-500 rounded-md">
                                        dsfsff
                                    </div>
                                </div>
                            </div>

                            <CardsContainer
                                title="Manga"
                                id={"manga"}
                                data={mangaData}
                                loading={mangaLoading}
                                error={managError}
                            />

                            <CardsContainer
                                title="Webtoon"
                                id={"webtoon"}
                                data={webtoonData}
                                loading={webtoonLoading}
                                error={webtoonErr}
                            />
                        </>
                    )}
                </section>

                {search ? "" : <Footer />}
            </section>
        </Page>
    );
}

export default Home;
