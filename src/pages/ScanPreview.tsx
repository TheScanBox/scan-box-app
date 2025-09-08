import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AiFillEye, AiFillHeart, AiFillStar, AiOutlineCalendar } from "react-icons/ai";
import { CiBookmark } from "react-icons/ci";
import {
    IoMdArrowDropright,
    IoIosArrowForward,
    IoIosArrowBack,
} from "react-icons/io";
import { BiCommentDetail } from "react-icons/bi";
import {
    cloudStorage,
    shareURL,
    retrieveLaunchParams,
    openPopup,
    openTelegramLink,
} from "@telegram-apps/sdk-react";
import {
    IoShareSocial,
    IoStarOutline,
    IoNotificationsOff,
    IoNotifications,
    IoPlay,
} from "react-icons/io5";
import { GoAlert } from "react-icons/go";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ScanResponse } from "../App";
import { Tag, ChapterItem } from "../components";
import { useQuery } from "@tanstack/react-query";
import { Page } from "../components/Page";
import api from "../libs/api";
import { useSafeArea } from "@/context/SafeAreaContext";
import ScanListHeader from "../components/ScanListHeader";
import { useAlert } from "../context/AlertContext";
import { createPortal } from "react-dom";
import StarRating from "../components/StarRating";
import { debounce } from "lodash";
import useRating from "../hooks/useRating";
import Loading from "@/components/Loading";
import { useUserScans } from "@/hooks/useUserScans";
import { useGetLikedChapters } from "@/hooks/useGetLikedChapters";
import useFetchChapters from "@/hooks/useFetchChapters";
import useIncrementView from "@/hooks/useIncrementView";
import useSubscription from "@/hooks/useSubscription";
import UseGetReadChapters from "@/hooks/UseGetReadChapters";
import TrailerView from "@/components/TrailerView";

export type FavBookType = {
    img: string;
    name: string;
    scanId: string;
};

export type LikeChapterType = {
    chapterNumber: number;
    likeCount: number;
};

type MenuPosition = {
    top: number;
    left: number;
}

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
    const [searchParams] = useSearchParams();

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, left: 0 });
    const [openRatings, setOpenRatings] = useState(false);
    const [openTrailer, setOpenTrailer] = useState(false);

    const [numChap, setNumChap] = useState(0);
    const [savedChap, setSavedChap] = useState<number | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(25);
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [readMore, setReadMore] = useState(false);
    const [allChapters, setAllChapters] = useState<
        { [index: string]: number }[]
    >([]);
    const [noData, setNoData] = useState(false);

    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;

    const { top, bottom } = useSafeArea();
    const { showAlert } = useAlert();

    const { getScanItem, addScan, deleteScan } = useUserScans(user?.id.toString() || "");

    const fetchData = async () => {
        const { data, status } = await api.get(`/scans/${param.id}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const { data, error, isLoading } = useQuery<ScanResponse>({
        queryKey: [`scan_${param.id}_${param.parentId}`],
        queryFn: fetchData,
        staleTime: Infinity,
    });

    const { data: chapData, error: chapError, isFetching: chapFetching, isLoading: chapLoading, refetch } = useFetchChapters({
        id: param.id || "",
        parentId: param.parentId,
        enabled: Boolean(param.id) && Boolean(data?.id),
    });

    const { loading: ratingLoading, rating, setRating } = useRating(user?.id.toString()!, param.id!, { enabled: Boolean(data?.id) });
    const { subscription, isLoadingSubscription, createSubscription, isCreating, deleteSubscription, isDeleting } = useSubscription({ scanId: param.id });
    const { data: likedChapters } = useGetLikedChapters<LikeChapterType[]>(param.id || "", { enabled: Boolean(data?.id) })
    const { data: readChapters } = UseGetReadChapters(param.id || "", user?.id.toString() || "", { enabled: Boolean(data?.id) })
    useIncrementView(param.id || "", { enabled: Boolean(data?.id) });

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
            // setTotalPage(Math.ceil(chapDataLength / 10));
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

            setSavedChap(
                parseInt(chapResults[`selectedChap-${param.id}`])
                    ? parseInt(chapResults[`selectedChap-${param.id}`])
                    : null
            );
        };

        fetchData();
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            if (
                menuRef.current &&
                !menuRef.current.contains(target) &&
                buttonRef.current &&
                !buttonRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const isTrailer = searchParams.get("trailer");

        if (isTrailer === "true") {
            setOpenTrailer(true);
            searchParams.delete("trailer");
        }

    }, [searchParams]);

    const isChapterLiked = (chapterNum: number) => {
        return likedChapters?.findIndex((chap) => chap.chapterNumber === chapterNum) !== -1;
    }

    const isChapterRead = (chapterNum: number) => {
        return readChapters?.findIndex((chap) => chap.chapterNumber === chapterNum) !== -1;
    }

    const handleToggleMenu = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();

            const popupWidth = 160; // same as w-40 in Tailwind (40 * 4px = 160px)
            const margin = 30;

            let left = rect.left;
            const top = rect.bottom + 5;

            // If popup would overflow right side, adjust left
            if (left + popupWidth > window.innerWidth) {
                left = window.innerWidth - popupWidth - margin;
            }

            // Prevent going negative (off the left side)
            if (left < margin) {
                left = margin;
            }

            setMenuPos({ top, left });
        }

        setOpen((prev) => !prev);
    };

    const handleRead = (chapterNum: number) => {
        // const path = param.parentId
        //     ? `/read/${param.parentId}/${chapterNum}/${param.id}`
        //     : `/read/${param.id}/${chapterNum}`;
        const path = param.parentId
            ? `/read/${param.id}/${chapterNum}/${param.parentId}`
            : `/read/${param.id}/${chapterNum}`;

        navigate(path, {
            state: {
                data: {
                    imgUrl: data?.imgUrl,
                    title: data?.title,
                    scanId: data?.scanId,
                    scanParentId: data?.scanParentId,
                    scanPath: data?.scanPath,
                },
                chapData,
                allChapters,
            },
        });
    };

    const handleMarks = async (key: "favourites" | "bookmarks") => {
        if (!data?.id) return;

        try {
            const itemInList = getScanItem(key, data.scanId);

            if (!itemInList) {
                await addScan({
                    type: key, data: {
                        id: "", // will be set in the backend
                        userId: user?.id.toString()!,
                        scanId: data?.scanId,
                        scanParentId: data?.scanParentId,
                        scanPath: data?.scanPath,
                        title: data?.title,
                        stars: data?.stars,
                        imgUrl: data?.imgUrl,
                        createdAt: new Date().toISOString(),
                    }
                });

                return;
            }

            if (itemInList) {
                await deleteScan({ type: key, scanId: data.scanId });
                return;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleShare = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;
        shareURL(`${APP_URL}?startapp=read_${param.id}`, `\nLisez les derniere chapitre de **${capitalize(data?.title || "")}** gratuitement !\n\n${data?.continuation && `**Chapitre apres l'anime : ${data.continuation}**`}`)
    };

    const handleRating = () => {
        setOpenRatings((prev) => !prev);
        setOpen(false);
    };

    const submitRating = debounce(async (rating: number) => {
        await setRating(rating.toFixed(1));
    }, 800);

    const handleAlert = () => {
        openTelegramLink(
            `https://t.me/TheScanBoxSupportBot?start=alert_${param.id}`
        );

        setOpen(false);
    };

    const handleSubscribe = async () => {
        if (isLoadingSubscription) return;

        try {
            if (!subscription) {
                await createSubscription({ scanId: param.id || "", userId: user?.id.toString() || "" });
                await openPopup({
                    title: "Abonnement",
                    message: "Vous êtes abonné avec succès ! Vous recevrez des notifications pour les nouveaux chapitres.",
                    buttons: [{ type: "ok" }]
                });
            } else {
                await deleteSubscription(subscription.id);
                await openPopup({
                    title: "Abonnement",
                    message: "Vous vous êtes désabonné avec succès ! Vous ne recevrez plus de notifications pour les nouveaux chapitres.",
                    buttons: [{ type: "ok" }]
                });
            }
        } catch (error) {
            console.log(error);
            await openPopup({
                title: "Abonnement",
                message: "Une erreur est survenue. Veuillez réessayer.",
                buttons: [{ type: "ok" }]
            });
        }

        setOpen(false);
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

    if (isLoading || !data) {
        return (
            <Page>
                <div
                    className="p-3 space-y-4 animate-pulse w-full md:max-w-[700px] mx-auto"
                    style={{
                        marginTop: showAlert ? 0 : top,
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
                className="py-3 space-y-4 relative h-screen flex flex-col md:max-w-[700px] mx-auto select-none"
                style={{
                    marginTop: showAlert ? 0 : top,
                }}
            >
                <div className="w-full min-h-56 flex gap-2.5 px-3">
                    <div
                        className={`h-full w-3/4 min-w-32 max-w-[150px] relative bg-slate-700`}
                    >
                        <img
                            src={data?.imgUrl}
                            className="w-full h-full object-cover object-center"
                            alt={data?.title}
                        />
                        <div className="">
                            {data?.status && (
                                <div
                                    className={`absolute top-2 right-2 ${data.status == "Ongoing" ? "bg-red-600" : "bg-slate-600"} text-white text-[0.65rem] px-2 py-1 rounded-md`}>
                                    {data.status == "Ongoing" ? "En cours" : data.status == "Completed" ? "Terminé" : data.status == "Hiatus" ? "Hiatus" : data.status == "Cancelled" ? "Annulé" : data.status}
                                </div>
                            )}
                        </div>
                        <div className="absolute top-0 left-0 right-0 bottom-0 z-40" />
                    </div>

                    <div className="space-y-3 w-full overflow-x-hidden overflow-y-visible">
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

                            {
                                data.releasedYear && (
                                    <p className="flex items-center gap-1 text-slate-400">
                                        <AiOutlineCalendar />
                                        <span className="text-xs">{data.releasedYear}</span>
                                    </p>
                                )
                            }
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleMarks("favourites")}
                                className={`p-2 flex rounded-md cursor-pointer ${Boolean(getScanItem("favourites", param.id || ""))
                                    ? "bg-red-600 text-white"
                                    : "bg-white text-red-600"
                                    } `}
                            >
                                <AiFillHeart size={24} />
                            </button>
                            <button
                                onClick={() => handleMarks("bookmarks")}
                                className={`p-2 flex rounded-md cursor-pointer ${Boolean(getScanItem("bookmarks", param.id || ""))
                                    ? "bg-slate-700  text-white"
                                    : "bg-white text-slate-700"
                                    }`}
                            >
                                <CiBookmark size={24} />
                            </button>
                            <button
                                onClick={handleShare}
                                className={`p-2 flex rounded-md bg-white cursor-pointer text-slate-700`}
                            >
                                <IoShareSocial size={24} />
                            </button>

                            <button
                                ref={buttonRef}
                                onClick={handleToggleMenu}
                                className={`-ml-1.5 flex rounded-md cursor-pointer text-slate-200`}
                            >
                                <BsThreeDotsVertical size={26} />
                            </button>
                        </div>

                        {
                            data.videoUrl && (
                                <div>
                                    <button
                                        onClick={() => setOpenTrailer(true)}
                                        className="flex items-center gap-2 cursor-pointer w-fit"
                                    >
                                        <IoPlay size={17} className="text-white bg-red-600 p-1 rounded-full" />
                                        <span className="text-slate-400 text-sm underline underline-offset-2">Joue le trailer</span>
                                    </button>
                                </div>
                            )
                        }

                        {openRatings && (
                            <div>
                                <StarRating
                                    initial={rating || 0}
                                    onRate={async (rating) => await submitRating(rating)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {open &&
                    createPortal(
                        <div
                            ref={menuRef}
                            style={{
                                top: `${menuPos.top}px`,
                                left: `${menuPos.left}px`,
                            }}
                            className="text-white text-sm bg-slate-700 absolute mt-4 w-40 rounded-md shadow-xl z-50"
                        >
                            <ul className="divide-y-[0.5px] divide-gray-500">
                                <li
                                    onClick={handleRating}
                                    className="px-3 py-2 flex gap-1.5 truncate items-center hover:bg-gray-500 cursor-pointer rounded-t-md"
                                >
                                    <span className="text-yellow-400">
                                        <IoStarOutline size={17} />
                                    </span>
                                    Notez {ratingLoading && "(?)"}
                                    {!ratingLoading && rating > 0 ? `(${rating.toFixed(1)})` : ""}
                                </li>
                                <li
                                    onClick={handleSubscribe}
                                    className="px-3 py-2 flex gap-1.5 truncate items-center hover:bg-gray-500 cursor-pointer"
                                >
                                    {
                                        (isCreating || isDeleting || isLoadingSubscription) ? <Loading className="w-4 h-4 text-white" /> : (
                                            <span>
                                                {!subscription ? <IoNotifications size={17} /> : <IoNotificationsOff size={17} />}
                                            </span>
                                        )}

                                    {isLoadingSubscription ? "Loading..." : !subscription ? "S'abonner" : "Se désabonner"}
                                </li>
                                <li className="px-3 py-2 hidden gap-1.5 truncate items-center hover:bg-gray-500 cursor-pointer">
                                    <span>
                                        <BiCommentDetail size={17} />
                                    </span>
                                    Comment... {`(?)`}
                                </li>
                                <li
                                    onClick={handleAlert}
                                    className="px-3 text-red-600 py-2 flex gap-1.5 truncate items-center hover:bg-gray-500 cursor-pointer rounded-b-md"
                                >
                                    <span>
                                        <GoAlert size={17} />
                                    </span>
                                    Signalé
                                </li>
                            </ul>
                        </div>,
                        document.body
                    )}

                <div className="space-y-4 ">
                    <div className="text-white px-3">
                        <h2 className="text-lg mb-2 font-bold">Synopsis</h2>
                        <p className="text-sm text-justify">
                            {readMore ? data.description : data.description.length > 200 ? `${data.description.slice(0, 200)}...` : data?.description}
                            {data?.description.length > 200 && (
                                <span
                                    onClick={() => setReadMore(!readMore)}
                                    className="cursor-pointer text-red-400 text-xs"
                                >
                                    {readMore ? " Voir Moins" : " Voir Plus"}
                                </span>
                            )}

                        </p>
                    </div>

                    {data?.continuation && (
                        <div>
                            <p className="text-xs text-slate-300 bg-slate-900/60 px-3 py-2">
                                Chapitre apres l'anime :{"  "}
                                <span className="font-normal text-slate-300 text-xs lowercase">
                                    {data.continuation}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 flex-wrap px-3">
                    {data?.tags?.map((tag, id) => (
                        <Tag key={id} name={tag.name} />
                    ))}
                </div>

                {(chapLoading || chapFetching) && !chapData && (
                    <div
                        className="flex flex-col justify-center items-center mt-6"
                        style={{
                            paddingBottom: bottom,
                        }}
                    >
                        <Loading
                            loadingText="Chargement des chapitres..."
                            className="w-5 h-5 text-slate-400"
                        />
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

                        <div className={`flex flex-col`}>
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
                                                chapterNum={Object.values(obj)[0]}
                                                img={data?.imgUrl}
                                                name={data?.title}
                                                isRead={isChapterRead(Number(Object.keys(obj)[0]))}
                                                isLiked={isChapterLiked(Number(Object.keys(obj)[0]))}
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
                                                chapterNum={Object.values(obj)[0]}
                                                img={data?.imgUrl}
                                                name={data?.title}
                                                isRead={isChapterRead(Number(Object.keys(obj)[0]))}
                                                isLiked={isChapterLiked(Number(Object.keys(obj)[0]))}
                                            />
                                        </div>
                                    ))}
                        </div>

                        {!isObjectEmpty(chapData) && (
                            <div className="fixed inset-x-0 bottom-0 md:max-w-[700px] mx-auto">
                                <button
                                    onClick={() => handleRead(savedChap ?? 1)}
                                    className="flex cursor-pointer items-center gap-1 absolute right-4 bg-red-600 px-3 py-2 rounded-lg text-white bottom-14"
                                    style={{
                                        bottom: `calc(${bottom}px + 3.5rem)`,
                                    }}
                                >
                                    <IoMdArrowDropright size={20} />
                                    {savedChap ? "Continue" : "Start"}
                                </button>
                            </div>)}

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
                                className={`${currentPage == numPages
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
                                        className={`w-8 h-8 flex items-center cursor-pointer justify-center text-white rounded-md ${currentPage === page
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
                                className={`${currentPage == 1
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
                    <div className="text-white flex flex-col justify-center items-center px-3">
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

            {openTrailer && data.videoUrl && (
                <TrailerView
                    videoUrl={data.videoUrl}
                    scanId={data.scanId}
                    title={data.title}
                    handleClose={() => setOpenTrailer(false)}
                />
            )}
        </Page>
    );
}

export default ScanPreview;
