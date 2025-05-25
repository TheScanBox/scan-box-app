import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScanResponse } from "../App";
import {
    AiFillEye,
    AiFillHeart,
    AiFillStar,
    AiOutlineDown,
} from "react-icons/ai";
import { CiBookmark } from "react-icons/ci";
import {
    IoMdArrowDropright,
    IoIosArrowForward,
    IoIosArrowBack,
} from "react-icons/io";
import {
    openTelegramLink,
    cloudStorage,
    exitFullscreen,
    mountViewport,
} from "@telegram-apps/sdk-react";
import { IoShareSocial } from "react-icons/io5";
import { Tag, ChapterItem } from "../components";
import { useQuery } from "@tanstack/react-query";
import { Page } from "../components/Page";
import Loading from "../components/Loading";
import api from "../libs/api";
import useSafeArea from "../hooks/useSafeArea";
import ScanListHeader from "../components/ScanListHeader";
import { useAlert } from "../context/AlertContext";

export type FavBookType = {
    img: string;
    name: string;
    scanId: string;
};

export const capitalize = (text: string) => {
    return text
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export const isObjectEmpty = (obj: Object | undefined) => {
    if (typeof obj != "object" || obj == null) return false;
    if (obj.hasOwnProperty("failed")) return true;

    return Object.keys(obj).length == 0;
};

function ScanPreview() {
    const param = useParams();
    const navigate = useNavigate();

    const [numChap, setNumChap] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [savedChap, setSavedChap] = useState<number | null>(null);
    const [isFavourite, setIsFavourite] = useState(false);
    const [bookmark, setBookmark] = useState(false);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(25);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [readMore, setReadMore] = useState(false);
    const [allChapters, setAllChapters] = useState<
        { [index: string]: number }[]
    >([]);
    const [noData, setNoData] = useState(false);

    const { top, bottom } = useSafeArea();
    const { unavailable } = useAlert();

    const fetchData = async () => {
        const { data, status } = await api.get(`/scan?scanID=${param.id}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const fetchChap = async () => {
        const { data, status } = await api.get(
            `/?key=${param.id}&subId=${param.subid || ""}`
        );

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const { data, error, isLoading } = useQuery<ScanResponse>({
        queryKey: [`scan_${param.id}_${param.subid}`],
        queryFn: fetchData,
        staleTime: 600000,
    });

    const {
        data: chapData,
        error: chapError,
        isFetching: chapFetching,
        isLoading: chapLoading,
        refetch,
    } = useQuery<{ [index: string]: number | boolean; failed: boolean }>({
        queryKey: [`chap_${param.id}`],
        queryFn: fetchChap,
        staleTime: 600000,
    });

    // useEffect(() => {
    //     const exitFull = async () => {
    //         if (isFullscreen()) await exitFullscreen();
    //     };

    //     exitFull();
    // }, []);

    useEffect(() => {
        if (isObjectEmpty(chapData) && chapData?.failed == true) {
            setNoData(true);
            return;
        }

        if (chapData) {
            const chapDataLength = Object.keys(chapData).length;
            const specialChapters =
                data?.specialChapters?.map((chap) => chap.chap) || [];

            setNumChap(chapDataLength);
            setNumPages(Math.ceil(chapDataLength / 10));
            setTotalPage(Math.ceil(chapDataLength / 10));
            setCurrentPage(Math.ceil(chapDataLength / 10));
            // setCurrentPage(1);
            setAllChapters(
                [
                    ...Array(
                        chapDataLength - specialChapters.length + 1
                    ).keys(),
                    ...specialChapters,
                ]
                    .sort((a, b) => a - b)
                    .slice(1)
                    .map((el, idx) => ({
                        [idx + 1]: el,
                    }))
            );
        }
    }, [chapData, data]);

    useEffect(() => {
        const fetchData = async () => {
            const chapResults = (await cloudStorage.getItem(
                `selectedChap-${param.id}`
            )) as unknown as { [index: string]: string };

            const favResults = (await cloudStorage.getItem(
                "favourites"
            )) as unknown as { [index: string]: string };
            const bookmarkResults = (await cloudStorage.getItem(
                "bookmarks"
            )) as unknown as { [index: string]: string };

            if (favResults && favResults["favourites"] != "") {
                const favouritesArr: FavBookType[] = JSON.parse(
                    favResults["favourites"]
                );

                const filterFavourites = favouritesArr?.find((result) => {
                    return result.scanId === data?.scanId;
                });

                setIsFavourite(filterFavourites ? true : false);
            }

            if (bookmarkResults && bookmarkResults["bookmarks"] != "") {
                const bookmarksArr: FavBookType[] = JSON.parse(
                    bookmarkResults["bookmarks"]
                );

                const filterBookmarks = bookmarksArr?.find(
                    (result) => result.scanId === data?.scanId
                );

                setBookmark(filterBookmarks ? true : false);
            }

            setSavedChap(
                parseInt(chapResults[`selectedChap-${param.id}`])
                    ? parseInt(chapResults[`selectedChap-${param.id}`])
                    : null
            );
        };

        fetchData();
    }, [data]);

    // useEffect(() => {
    //     const resetData = async () => {
    //         await cloudStorage.setItem("favourites", "");
    //         await cloudStorage.setItem("bookmarks", "");

    //         console.log("Reset");
    //     };

    //     resetData();
    // }, []);

    const handleRead = (chapterNum: number) => {
        navigate(`/read/${param.id}/${chapterNum}`, {
            state: {
                data: {
                    imgUrl: data?.imgUrl,
                    title: data?.title,
                    scanId: data?.scanId,
                    scanPath: data?.scanPath,
                },
                chapData,
                allChapters,
            },
        });
    };

    const handleMarks = async (key: "favourites" | "bookmarks") => {
        try {
            key == "bookmarks"
                ? setBookmark(!bookmark)
                : setIsFavourite(!isFavourite);

            const result = (await cloudStorage.getItem(key)) as unknown as {
                [index: string]: string;
            };

            const item = {
                imgUrl: data?.imgUrl,
                title: data?.title,
                scanId: data?.scanId,
                stars: data?.stars,
            };

            if (!result || result[key] == "") {
                await cloudStorage.setItem(key, JSON.stringify([item]));

                return;
            }

            const bookmarksArr: Array<typeof item> = JSON.parse(result[key]);

            const isInList = bookmarksArr.find(
                (el) => el.scanId == data?.scanId
            );

            const filterBookmarks = bookmarksArr.filter(
                (result) => result.scanId != data?.scanId
            );

            if (isInList) {
                await cloudStorage.setItem(
                    key,
                    JSON.stringify([...filterBookmarks])
                );

                return;
            }

            await cloudStorage.setItem(
                key,
                JSON.stringify([item, ...filterBookmarks])
            );
        } catch (error) {
            console.log(error);

            key == "bookmarks"
                ? setBookmark(!bookmark)
                : setIsFavourite(!isFavourite);
        }
    };

    const handleShare = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;

        openTelegramLink(
            `https://t.me/share/url?text=${encodeURIComponent(
                `Lisez les derniere chapitre de **${capitalize(
                    data?.title || ""
                )}** gratuitement !\n\n${
                    data?.continuation &&
                    `**Chapitre apres l'anime : **${data.continuation}\n\n`
                }${`${APP_URL}?startapp=read_${param.id}`}`
            )}`
        );
    };

    if ((!data || !data.id || error) && !isLoading) {
        return (
            <Page>
                <div className="h-screen flex flex-col justify-center items-center text-white">
                    <h1 className="text-2xl">Scan Not Found</h1>
                    <button
                        className="text-slate-500 underline"
                        onClick={() => navigate("/home")}
                    >
                        Back to Home
                    </button>
                </div>
            </Page>
        );
    }

    if (isLoading) {
        return (
            <Page>
                <div
                    className="p-3 space-y-4 animate-pulse w-full lg:max-w-[700px] mx-auto"
                    style={{
                        marginTop: unavailable ? 0 : top,
                    }}
                >
                    <div className="w-full h-56 flex gap-4">
                        <div className="h-full w-2/5 bg-slate-700" />

                        <div className="pt-2 space-y-3 w-3/5">
                            <div className="w-full space-y-2">
                                <h2 className="w-3/4 h-3 bg-slate-700" />
                                <p className="w-1/2 h-2 bg-slate-700" />
                            </div>

                            <div className="flex gap-4">
                                <p className="flex items-center gap-1">
                                    <span className="w-6 h-2 bg-slate-700" />
                                </p>

                                <p className="flex items-center gap-1">
                                    <span className="w-6 h-2 bg-slate-700" />
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-full space-y-2">
                            <h2 className="bg-slate-700 w-1/2 h-3" />
                            <div className="w-full space-y-2">
                                <p className="w-full h-2 bg-slate-700" />
                                <p className="w-full h-2 bg-slate-700" />
                                <p className="w-full h-2 bg-slate-700" />
                                <p className="w-full h-2 bg-slate-700" />
                                <p className="w-full h-2 bg-slate-700" />
                                <p className="w-full h-2 bg-slate-700" />
                                <p className="w-full h-2 bg-slate-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </Page>
        );
    }

    const getPageNumbers = () => {
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(numPages, currentPage + 2);

        // Adjust range if near start
        if (currentPage <= 2) {
            end = Math.min(5, numPages);
        }

        // Adjust range if near end
        if (currentPage >= numPages - 1) {
            start = Math.max(numPages - 4, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <Page>
            <div
                className="p-3 space-y-4 relative h-screen flex flex-col lg:max-w-[700px] mx-auto select-none"
                style={{
                    marginTop: unavailable ? 0 : top,
                }}
            >
                <div className="w-full min-h-56 flex gap-2">
                    <div
                        className="h-full w-3/4 min-w-32 max-w-[150px] bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${data?.imgUrl})`,
                        }}
                    />

                    <div>
                        {/* <img
                        src={`${data?.imgUrl}`}
                        alt="1"
                        className="h-full w-2/5 object-cover"
                    /> */}
                    </div>

                    <div className="space-y-3 w-full overflow-hidden">
                        <div className="w-full">
                            <h2 className="text-lg text-white font-bold break-words capitalize">
                                {data?.title}
                            </h2>
                            <p className="text-xs text-slate-400 truncate capitalize">
                                Par {data?.author?.name ?? "Unknown"}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <p className="flex items-center gap-1">
                                <AiFillStar color="yellow" />
                                <span className="text-white text-xs">
                                    {data?.stars}
                                </span>
                            </p>

                            <p className="flex items-center gap-1 text-slate-400">
                                <AiFillEye />
                                <span className="text-xs">N/A</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleMarks("favourites")}
                                className={`p-2 flex rounded-md ${
                                    isFavourite
                                        ? "bg-red-600 text-white"
                                        : "bg-white text-red-600"
                                } `}
                            >
                                <AiFillHeart size={24} />
                            </button>
                            <button
                                onClick={() => handleMarks("bookmarks")}
                                className={`p-2 flex rounded-md ${
                                    bookmark
                                        ? "bg-slate-700  text-white"
                                        : "bg-white text-slate-700"
                                }`}
                            >
                                <CiBookmark size={24} />
                            </button>
                            <button
                                onClick={handleShare}
                                className={`p-2 flex rounded-md bg-white text-slate-700"}`}
                            >
                                <IoShareSocial size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-white">
                        <h2 className="text-lg mb-2 font-bold">Synopsis</h2>
                        <p className="text-sm text-justify">
                            {readMore
                                ? data?.description
                                : data?.description.slice(0, 250)}
                            {readMore ? " " : "... "}
                            <span
                                className="underline cursor-pointer text-red-400"
                                onClick={() => setReadMore((prev) => !prev)}
                            >
                                {readMore ? "Redius" : "Voir plus"}
                            </span>
                        </p>
                    </div>

                    {data?.continuation && (
                        <div>
                            <p className="text-xs text-slate-300 lowercase">
                                chapitre apres l'anime :{"  "}
                                <span className="font-normal text-slate-300 text-xs">
                                    {data.continuation}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 flex-wrap">
                    {data?.tags?.map((tag, id) => (
                        <Tag key={id} name={tag.name} />
                    ))}
                </div>

                {(chapLoading || chapFetching) && (
                    <div
                        className="flex flex-col justify-center items-center mt-14"
                        style={{
                            paddingBottom: bottom,
                        }}
                    >
                        <Loading />
                        <p className="text-xs text-slate-400 mt-2">
                            Chargement...
                        </p>
                    </div>
                )}

                {!chapLoading && !chapError && !noData && (
                    <>
                        <ScanListHeader
                            numChap={numChap}
                            numPages={numPages}
                            order={order}
                            specialChaptersLength={
                                data?.specialChapters?.length || 0
                            }
                            setCurrentPage={setCurrentPage}
                            setOrder={setOrder}
                        />

                        <div className={`flex flex-col gap-2`}>
                            {order == "desc"
                                ? [...allChapters]
                                      .reverse()
                                      .slice(
                                          (numPages - currentPage) * 10,
                                          (numPages - currentPage) * 10 + 10
                                      )
                                      .map((obj) => (
                                          <div
                                              key={Object.keys(obj)[0]}
                                              onClick={() =>
                                                  handleRead(
                                                      parseInt(
                                                          Object.keys(obj)[0]
                                                      )
                                                  )
                                              }
                                              className="cursor-pointer hover:opacity-40"
                                          >
                                              <ChapterItem
                                                  chapterNum={
                                                      Object.values(obj)[0]
                                                  }
                                                  img={data?.imgUrl}
                                                  name={data?.title}
                                              />
                                          </div>
                                      ))
                                : allChapters
                                      .slice(
                                          (currentPage - 1) * 10,
                                          (currentPage - 1) * 10 + 10
                                      )
                                      .map((obj) => (
                                          <div
                                              key={Object.keys(obj)[0]}
                                              onClick={() =>
                                                  handleRead(
                                                      parseInt(
                                                          Object.keys(obj)[0]
                                                      )
                                                  )
                                              }
                                              className="cursor-pointer hover:opacity-40"
                                          >
                                              <ChapterItem
                                                  chapterNum={
                                                      Object.values(obj)[0]
                                                  }
                                                  img={data?.imgUrl}
                                                  name={data?.title}
                                              />
                                          </div>
                                      ))}
                        </div>

                        <button
                            onClick={() => handleRead(savedChap ?? 1)}
                            className="flex items-center gap-1 fixed right-4 bg-red-600 px-3 py-2 rounded-lg text-white bottom-14"
                            style={{
                                bottom: `calc(${bottom}px + 3.5rem)`,
                            }}
                        >
                            <IoMdArrowDropright size={20} />
                            {savedChap ? "Continue" : "Start"}
                        </button>

                        <div
                            className="flex items-center pb-4 gap-3 justify-center w-full"
                            style={{
                                paddingBottom: bottom ? bottom : "1rem",
                            }}
                        >
                            <div
                                onClick={() => {
                                    if (currentPage == numPages) return;

                                    setCurrentPage(currentPage + 1);
                                }}
                                className={`${
                                    currentPage == numPages
                                        ? "cursor-not-allowed opacity-35"
                                        : "cursor-pointer"
                                }`}
                            >
                                <IoIosArrowBack
                                    color="white"
                                    className="font-bold"
                                    size={18}
                                />
                            </div>

                            {getPageNumbers()
                                .reverse()
                                .map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 flex items-center justify-center text-white rounded-md ${
                                            currentPage === page
                                                ? "bg-red-400"
                                                : "bg-slate-500"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                            <div
                                onClick={() => {
                                    if (currentPage == 1) return;

                                    setCurrentPage(currentPage - 1);
                                }}
                                className={`${
                                    currentPage == 1
                                        ? "cursor-not-allowed opacity-35"
                                        : "cursor-pointer"
                                }`}
                            >
                                <IoIosArrowForward
                                    color="white"
                                    className="font-bold"
                                    size={18}
                                />
                            </div>
                        </div>
                    </>
                )}

                {(chapError || noData) && !chapFetching && (
                    <div className="text-white flex flex-col justify-center items-center">
                        <ScanListHeader
                            numChap={numChap}
                            numPages={numPages}
                            order={order}
                            specialChaptersLength={
                                data?.specialChapters?.length || 0
                            }
                            setCurrentPage={setCurrentPage}
                            setOrder={setOrder}
                        />

                        <div className="w-full flex flex-col items-center my-3">
                            <p className="text-slate-300">
                                An Unknown Error Occured
                            </p>
                            <button
                                className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm cursor-pointer hover:bg-red-600/50"
                                onClick={() => refetch()}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Page>
    );
}

export default ScanPreview;
