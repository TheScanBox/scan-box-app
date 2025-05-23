import ScanLectureControls from "../components/ScanLectureControls";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ScanResponse } from "../App";
import ScanLectureControlsBottom from "../components/ScanLectureControlsBottom";
import { cloudStorage } from "@telegram-apps/sdk-react";

import { Page } from "../components/Page";
import Loading from "../components/Loading";
import { useQuery } from "@tanstack/react-query";
import api from "../libs/api";
import ProgressBar from "../components/ProgressBar";
import { capitalize, isObjectEmpty } from "./ScanPreview";
import { useAlert } from "../context/AlertContext";

function ScanLecture() {
    const param = useParams() as {
        id: string;
        chapter: string;
    };
    const location = useLocation();

    const [pageUrls, setPageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [chapterName, setChapterName] = useState<number>();
    const [notFound, setNotFound] = useState(false);
    const [allChapters, setAllChapters] =
        useState<{ [index: string]: number }[]>();

    const scrollRef = useRef<HTMLDivElement | null>(null);
    // const hasMounted = useRef(false);

    const {
        state,
    }: {
        state: {
            chapData: { [index: string]: number } | undefined;
            data: ScanResponse & { chap?: string };
            allChapters: { [index: string]: number }[];
        };
    } = useLocation();

    const [selectedChap, setSelectedChap] = useState(
        param.chapter || state?.data?.chap || "1"
    );

    // useEffect(() => {
    //     const fullScreen = async () => {
    //         if (mountViewport.isAvailable() && !isViewportMounting()) {
    //             if (!hasMounted.current) {
    //                 hasMounted.current = true;
    //                 await mountViewport();

    //                 if (requestFullscreen.isAvailable() && !isFullscreen()) {
    //                     try {
    //                         await requestFullscreen();
    //                     } catch (error) {
    //                         alert(JSON.stringify(error));
    //                     }
    //                 }
    //             }
    //         }
    //     };

    //     fullScreen();
    // }, []);

    const fetchChap = async () => {
        const { data, status } = await api.get(`/?key=${param.id}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const fetchSpecialChap = async () => {
        const { data, status } = await api.get(`/specials/?key=${param.id}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const updateScrollProgress = (e: any) => {
        const scrollTop = e.target.scrollTop!;
        const scrollHeight = scrollRef?.current?.scrollHeight || 0;
        const progress = (scrollTop / scrollHeight) * 100;

        setScrollProgress(progress);
    };

    const {
        data: chapData,
        isLoading,
        error: loadError,
    } = useQuery({
        queryKey: [[`chap_${param.id}`]],
        queryFn: fetchChap,
        enabled: !state?.chapData,
    });

    const {
        data: specialChapters,
        isLoading: specialChaptersLoading,
        error: specialChaptersError,
    } = useQuery<{ chap: number }[], Error>({
        queryKey: [[`special_${param.id}`]],
        queryFn: fetchSpecialChap,
        enabled: !state?.allChapters,
    });

    useEffect(() => {
        if (!state.allChapters && !allChapters) return;
        let all = state?.allChapters ? state?.allChapters : allChapters;

        if (!all) return;

        const [chapName] = Object.values(all[Number(selectedChap) - 1]);

        const updateData = async () => {
            await cloudStorage.setItem(
                `selectedChap-${param.id}`,
                selectedChap
            );

            const result = (await cloudStorage.getItem(
                "recents"
            )) as unknown as { [index: string]: string };

            const item = {
                imgUrl: state.data?.imgUrl,
                title: state.data?.title,
                chap: selectedChap,
                chapName: chapName || "",
                scanId: state.data.scanId,
                scanPath: state.data.scanPath,
            };

            if (!result || result["recents"] == "") {
                await cloudStorage.setItem("recents", JSON.stringify([item]));

                return;
            }

            const recentsArr: Array<typeof item> = JSON.parse(
                result["recents"]
            );

            const filteredRecents = recentsArr.filter(
                (result) => result.scanId != item?.scanId
            );

            await cloudStorage.setItem(
                "recents",
                JSON.stringify([item, ...filteredRecents])
            );
        };

        let pages = [];

        if (!param.id) return;

        if (!state?.chapData && !chapData) return;

        const newChapData = state?.chapData ? state?.chapData : chapData;

        for (let i = 1; i <= newChapData?.[`eps${selectedChap}`]; i++) {
            pages.push(
                `https://anime-sama.fr/s2/scans/${state.data.scanPath}/${selectedChap}/${i}.jpg`
            );
        }

        const firstImage = new Image();

        firstImage.onload = function () {
            setLoading(false);
        };

        firstImage.onerror = function () {
            setLoading(false);
            setError(true);
        };

        firstImage.src = pages[0];

        setPageUrls(pages);
        setLoading(true);
        setChapterName(chapName);

        updateData();
    }, [selectedChap, state.data, chapData, allChapters]);

    useEffect(() => {
        if (state?.allChapters || !specialChapters) return;
        if (isObjectEmpty(chapData) || !chapData) return;

        const chapDataLength = Object.keys(state?.chapData || chapData).length;
        const speChapter = specialChapters.map((s) => s.chap);

        const all = [
            ...Array(chapDataLength - specialChapters.length + 1).keys(),
            ...speChapter,
        ]
            .sort((a, b) => a - b)
            .slice(1)
            .map((el, idx) => ({
                [idx + 1]: el,
            }));

        if (Number(selectedChap) > all.length) {
            setNotFound(true);

            return;
        }
        setAllChapters(all);
    }, [specialChapters, chapData]);

    if (notFound) {
        const scanId = location.pathname.split("/")[2];

        return (
            <Page>
                <div className="h-screen flex flex-col justify-center items-center text-white">
                    <h1 className="text-2xl font-bold">Chapitre Introuvable</h1>
                    <p className="text-sm text-slate-400">Please Try Later</p>

                    <Link
                        to={`../details/${scanId}`}
                        replace
                        className="underline text-sm mt-3 text-red-600 "
                    >
                        Back To {capitalize(state.data.title)}
                    </Link>
                </div>
            </Page>
        );
    }

    if (
        error ||
        loadError ||
        specialChaptersError ||
        (!state.chapData && isObjectEmpty(chapData))
    ) {
        return (
            <Page>
                <div className="h-screen flex flex-col justify-center items-center text-white">
                    <h1 className="text-2xl font-bold">
                        An Unknown Error Occured
                    </h1>
                    <p className="text-sm text-slate-400">Please Try Later</p>

                    <Link to={"/"} className="underline text-sm mt-3">
                        Back To Home
                    </Link>
                </div>
            </Page>
        );
    }

    if (isLoading || specialChaptersLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-screen overflow-y-hidden text-white">
                <Loading />
                <p className="text-xs text-slate-400 mt-4">
                    Chargement de la Page...
                </p>
            </div>
        );
    }

    return (
        <Page>
            <section
                ref={scrollRef}
                onScroll={(e) => updateScrollProgress(e)}
                className="relative h-screen image-gallery lg:max-w-[700px] mx-auto"
            >
                <ScanLectureControls
                    numChap={Object.keys(state?.chapData || chapData).length}
                    setSelectedChap={setSelectedChap}
                    selectedChapName={chapterName?.toString() || ""}
                    selectedChap={selectedChap}
                    scanID={param.id}
                    showControls={showControls}
                    title={state.data.title}
                />

                <div
                    className="z-10 w-full h-full"
                    // onClick={() => setShowControls((prev) => !prev)}
                    onTouchStart={() => {
                        setShowControls(false);
                    }}
                    onDoubleClick={() => setShowControls(!showControls)}
                >
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-screen w-screen overflow-y-hidden text-white">
                            <Loading />
                            <p className="text-xs text-slate-400 mt-4">
                                Chargement des données...
                            </p>
                        </div>
                    ) : (
                        pageUrls.map((url, index) => (
                            <div className="relative" key={index}>
                                <LazyLoadImage
                                    className="z-0 object-contain"
                                    key={index}
                                    src={url}
                                    alt={`Page ${index}`}
                                    placeholder={
                                        <div className="flex justify-center items-center">
                                            <img
                                                src="loader.gif"
                                                className="w-10 h-10"
                                            />
                                        </div>
                                    }
                                />
                                <div className="absolute top-0 right-0 left-0 bottom-0 z-10" />
                            </div>
                        ))
                    )}
                </div>

                <ProgressBar scrollProgress={scrollProgress} />

                <ScanLectureControlsBottom
                    numChap={Object.keys(state.chapData || chapData).length}
                    showControls={showControls}
                    setSelectedChap={setSelectedChap}
                    selectedChap={selectedChap}
                />
            </section>
        </Page>
    );
}

export default ScanLecture;

//
