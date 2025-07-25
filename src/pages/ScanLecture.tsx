import ScanLectureControls from "../components/ScanLectureControls";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ScanResponse } from "../App";
import ScanLectureControlsBottom from "../components/ScanLectureControlsBottom";

import { Page } from "../components/Page";
import Loading from "../components/Loading";

import ProgressBar from "../components/ProgressBar";
import { capitalize, isObjectEmpty } from "./ScanPreview";
import VerticalSlider from "../components/VerticalSlider";
import useLocalStorage from "../hooks/useLocalStorage";

import ScanLoader from "../components/ScanLoader";
import useFetchImages from "../hooks/useFetchImages";
import useFetchSpecialChapters from "@/hooks/useFetchSpecialChapters";
import useFetchChapters from "@/hooks/useFetchChapters";

export type StateType = {
    chapData: { [index: string]: number } | undefined;
    data: ScanResponse & { chap?: string };
    allChapters: { [index: string]: number }[];
}

function ScanLecture() {
    const param = useParams() as {
        id: string;
        chapter: string;
        parentId?: string;
    };
    const location = useLocation();

    const [error, setError] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);

    const [notFound, setNotFound] = useState(false);
    const [allChapters, setAllChapters] =
        useState<{ [index: string]: number }[]>();

    const scrollRef = useRef<HTMLDivElement | null>(null);
    // const hasMounted = useRef(false);

    const [visible, setVisible] = useState(false);
    const [showLightConfig, setShowLightConfig] = useState(false);
    const [luminousity, setLiminousity] = useLocalStorage("luminousity", 100);

    const {
        state,
    }: {
        state: StateType;
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

    const handleScroll = () => {
        document.documentElement.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const {
        data: chapData,
        isLoading,
        error: loadError,
    } = useFetchChapters({
        id: param.id,
        parentId: param.parentId,
        enabled: !state?.chapData,
    });

    const { data: specialChapters, isLoading: specialChaptersLoading, error: specialChaptersError } = useFetchSpecialChapters({
        id: param.id,
        enabled: !state?.allChapters
    });

    const { loading, images, chapterName } = useFetchImages({
        state: state,
        id: param.id,
        allChapters: allChapters!,
        chapData: chapData,
        selectedChap: selectedChap,
    });

    useEffect(() => {
        const updateScrollProgress = (e: any) => {
            e.preventDefault();
            e.stopPropagation();

            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop =
                document.documentElement.scrollTop || window.scrollY || 0;

            const progress = (scrollTop / scrollHeight) * 100;

            setScrollProgress(progress);
            setVisible(scrollTop > 600);
        };

        document.addEventListener("scroll", updateScrollProgress);

        return () =>
            document.removeEventListener("scroll", updateScrollProgress);
    }, []);

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
        isObjectEmpty(state?.chapData || chapData)
    ) {
        return (
            <Page>
                <div className="h-screen flex flex-col justify-center items-center text-white">
                    <h1 className="text-2xl font-bold">
                        An Unknown Error Occured
                    </h1>
                    <p className="text-sm text-slate-400">Please Try Later</p>

                    <Link to={"/home"} className="underline text-sm mt-3">
                        Back To Home
                    </Link>
                </div>
            </Page>
        );
    }

    if (isLoading || specialChaptersLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-screen overflow-y-hidden text-white">
                <Loading loadingText="Chargement de la Page..." />
            </div>
        );
    }

    return (
        <Page>
            <section
                ref={scrollRef}
                className="relative w-full lg:max-w-[700px] mx-auto select-none"
            >
                <ScanLectureControls
                    numChap={Object.keys(state?.chapData || chapData).length}
                    setSelectedChap={setSelectedChap}
                    selectedChapName={chapterName?.toString() || ""}
                    selectedChap={selectedChap}
                    scanID={param.id}
                    showControls={showControls}
                    title={state.data.title}
                    setShowLightConfig={setShowLightConfig}
                />

                <ScanLoader
                    images={images}
                    luminousity={luminousity}
                    setShowControls={setShowControls}
                    setShowLightConfig={setShowLightConfig}
                    pageLoading={loading}
                />

                {showLightConfig && (
                    <VerticalSlider
                        min={0}
                        max={100}
                        value={luminousity}
                        step={1}
                        onChange={(v) => setLiminousity(v)}
                    />
                )}

                <ProgressBar scrollProgress={scrollProgress} />

                <ScanLectureControlsBottom
                    numChap={Object.keys(state.chapData || chapData).length}
                    showControls={showControls}
                    setSelectedChap={setSelectedChap}
                    selectedChap={selectedChap}
                    visible={visible}
                    handleScroll={handleScroll}
                    scanId={param.id}
                    chapterNumber={selectedChap}
                    parentId={param.parentId}
                    state={state}
                    showTip={scrollProgress >= 95}
                />
            </section>
        </Page>
    );
}

export default ScanLecture;

//
