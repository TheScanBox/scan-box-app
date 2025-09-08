import { ScanResponse } from "@/App";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import { useSafeArea } from "@/context/SafeAreaContext";
import useUser from "@/hooks/useUser";
import { ScanType, useUserScans } from "@/hooks/useUserScans";
import { RecentScan } from "@/types";
import { formatDate } from "@/utils/dateFormat";
import { isPopupOpened, openPopup } from "@telegram-apps/sdk-react";
import { IoIosTrash } from "react-icons/io";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";

// fix chapterNumber type to also include special chapters

export const RecentCard = ({ item, handleRead, onDelete, isProfile = true }: {
    item: RecentScan;
    handleRead: (data: RecentScan, isProfile: boolean) => void;
    isProfile?: boolean;
    onDelete?: () => void;
}) => (
    <div
        onClick={() => handleRead(item, isProfile)}
        className={`flex w-32 min-w-32 md:w-40 md:min-w-40 flex-col gap-2 text-white cursor-pointer`}
    >
        <div className="w-full h-40 md:h-52 relative">
            <LazyLoadImage
                src={item.imgUrl}
                className="w-full h-full object-cover"
                alt="img"
                placeholder={<div className="w-full h-full bg-slate-400 animate-pulse" />}
            />
            <div className="absolute top-0 bottom-0 left-0 right-0 z-10" />
            {isProfile && <div
                className="absolute top-2 right-2 z-20 hover:text-red-700"
                onClick={async (e) => {
                    e.stopPropagation();
                    onDelete?.();
                }}
            >
                <IoIosTrash size={20} />
            </div>}
        </div>
        <div className="space-y-1">
            <p className="text-xs truncate capitalize">{item.title}</p>
            <p className="text-[0.6rem] truncate text-slate-400">CH {item.chapterName}</p>
            {isProfile && item.lastReadAt && <p className="text-[0.6rem] truncate text-slate-400">{formatDate(item.lastReadAt)}</p>}
        </div>
    </div>
);

const Scans = () => {
    const navigate = useNavigate();
    const { bottom } = useSafeArea();
    const user = useUser();
    const { isLoading, isError, data, refetch, deleteScan } = useUserScans(user?.id.toString());

    const handleRead = (data: RecentScan) => {
        const path = data.scanParentId
            ? `../read/${data.scanId}/${data.chapterNumber}/${data.scanParentId}`
            : `../read/${data.scanId}/${data.chapterNumber}`;

        navigate(path, {
            state: {
                data,
            },
        });
    };

    const handleDelete = async (title: string, type: ScanType, id: string) => {
        if (isPopupOpened()) return;

        const result = await openPopup({
            title: "Supprime",
            message: `Supprime ${title} de la liste ?`,
            buttons: [
                {
                    text: "Confirme",
                    type: "destructive",
                    id: "delete",
                },
                {
                    type: "cancel",
                },
            ],
        });

        if (result != "delete") return;
        if (!type) return;

        await deleteScan({ type, scanId: id });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center mt-2">
                <Loading
                    loadingText="Chargement..."
                    className="w-5 h-5"
                />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center mt-2">
                <p className="text-xs text-red-500">Une erreur est survenue lors du chargement des scans.</p>
                <button
                    className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm"
                    onClick={() => refetch()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    const { favourites = [], bookmarks = [], recents = [] } = data || {};

    return (
        <div
            className="flex flex-col gap-6 px-3"
            style={{
                paddingBottom: bottom + 16,
            }}
        >
            {
                !!recents.length && (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-4">
                            🕒 Historique{" "}
                        </h2>
                        <div className=" flex gap-2 w-full overflow-x-auto no-scrollbar">
                            {recents.length == 0 ? (
                                <p className="text-xs w-full text-center text-slate-500">
                                    Nothing yet
                                </p>
                            ) : (
                                recents
                                    .sort((a, b) => new Date(b.lastReadAt!).getTime() - new Date(a.lastReadAt!).getTime())
                                    .map((item, index) => (
                                        <RecentCard
                                            key={index}
                                            item={item}
                                            handleRead={handleRead}
                                            onDelete={() => handleDelete(item.title!, "recents", item.scanId!)}
                                        />
                                    )
                                    )
                            )}
                        </div>
                    </div>
                )}

            {
                !!favourites.length &&
                (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-4">
                            <span className="text-red-600">❤</span>{" "}
                            Favoris
                        </h2>
                        <div className="w-full flex gap-2 overflow-x-auto no-scrollbar">
                            {favourites.length == 0 ? (
                                <p className="text-xs w-full text-center text-slate-500">
                                    A list of favourite scan
                                </p>
                            ) : (
                                favourites.map((item) => (
                                    <Card
                                        key={item.scanId}
                                        id={item.scanId!}
                                        parentId={
                                            item.scanParentId || ""
                                        }
                                        imgUrl={item.imgUrl!}
                                        title={item.title!}
                                        stars={item.stars}
                                        isProfile={true}
                                        type="favourites"
                                        onDelete={() => handleDelete(item.title!, "favourites", item.scanId!)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

            {
                !!bookmarks.length &&
                (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                            📺 Watchlist
                        </h2>
                        <div className="flex w-full gap-2 overflow-x-auto no-scrollbar">
                            {bookmarks.length == 0 ? (
                                <p className="text-xs w-full text-center text-slate-500">
                                    Add scan to read later
                                </p>
                            ) : (
                                bookmarks.map((item) => (
                                    <Card
                                        key={item.scanId}
                                        id={item.scanId!}
                                        imgUrl={item.imgUrl!}
                                        title={item.title!}
                                        parentId={
                                            item.scanParentId || ""
                                        }
                                        stars={item.stars}
                                        isProfile={true}
                                        type="bookmarks"
                                        onDelete={() => handleDelete(item.title!, "bookmarks", item.scanId!)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

            {
                !recents.length && !favourites.length && !bookmarks.length && (
                    <div>
                        <p className="text-xs w-full text-center text-slate-400 px-3">
                            Continuez à explorer l'application.
                            Votre contenu favori apparaîtra ici.
                        </p>
                    </div>
                )}
        </div>
    );
}

export default Scans