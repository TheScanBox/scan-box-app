import { Page } from "@/components/Page";
import SearchBar from "./components/SearchBar";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useAlert } from "@/context/AlertContext";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { BookmarkScan, FavoriteScan, RecentScan, UserScansData } from "@/types";
import api from "@/libs/api";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import { Card } from "@/components";
import { RecentCard } from "../tabs/Scans";
import { useNavigate } from "react-router-dom";
import { isPopupOpened, openPopup } from "@telegram-apps/sdk-react";
import { ScanType, useUserScans } from "@/hooks/useUserScans";
import useUser from "@/hooks/useUser";

type Props = {
    searchTerm?: string;
};

const UseScanSearch = ({ searchTerm = "" }: Props) => {

    const fetchScans = async (searchTerm: string) => {
        const favoriteResponse = api.get<FavoriteScan[]>(`/favorite/search?q=${searchTerm}`);
        const bookmarkResponse = api.get<BookmarkScan[]>(`/bookmark/search?q=${searchTerm}`);
        const recentResponse = api.get<RecentScan[]>(`/readscan/search?q=${searchTerm}`);

        const [favoriteResults, bookmarkResults, recentResults] = await Promise.all([
            favoriteResponse,
            bookmarkResponse,
            recentResponse
        ]);

        if (favoriteResults.status !== 200 || bookmarkResults.status !== 200 || recentResults.status !== 200) {
            throw new Error('Network response was not ok');
        }

        const favoriteData = favoriteResults.data;
        const bookmarkData = bookmarkResults.data;
        const recentData = recentResults.data;

        return {
            favourites: favoriteData || [],
            bookmarks: bookmarkData || [],
            recents: recentData || [],
        };
    }

    const query = useQuery<UserScansData>({
        queryKey: ["scans_search", searchTerm],
        queryFn: () => fetchScans(searchTerm),
        enabled: searchTerm.length >= 3,
    });

    return { ...query };

}

const ScanSearch = () => {
    const { bottom, top } = useSafeArea();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const user = useUser();
    const { deleteScan } = useUserScans(user?.id.toString());


    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, isLoading, isError, refetch } = UseScanSearch({ searchTerm: debouncedSearch.toLowerCase() });

    const handleRead = (data: RecentScan) => {
        const path = data.scanParentId
            ? `/read/${data.scanId}/${data.chapterNumber}/${data.scanParentId}`
            : `/read/${data.scanId}/${data.chapterNumber}`;

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

    return (
        <Page>
            <div
                className="text-white"
                style={{ marginTop: showAlert ? 0 : top, paddingBottom: bottom + 16 }}
            >
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <h2 className="text-xl font-bold px-3">Mes Scans</h2>

                {isLoading && (
                    <div className="mt-4">
                        <Loading
                            className="w-5 h-5 text-slate-400"
                            loadingText="Recherche en cours..." />
                    </div>
                )}

                {
                    !isLoading && isError && (
                        <div className="mt-4 px-3">
                            <p className="text-red-500">Une erreur est survenue lors de la recherche. Veuillez réessayer.</p>
                            <button
                                onClick={() => refetch()}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Réessayer
                            </button>
                        </div>
                    )
                }

                {
                    !isLoading && !isError && data && data.favourites.length === 0 && data.bookmarks.length === 0 && data.recents.length === 0 && searchTerm.length >= 3 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Aucun scan trouvé pour "{searchTerm}".</div>
                    )
                }

                {
                    !isLoading && !isError && searchTerm.length > 0 && searchTerm.length < 3 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Veuillez entrer au moins 3 caractères pour lancer la recherche.</div>
                    )
                }

                {
                    !isLoading && !isError && searchTerm.length === 0 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Utilisez la barre de recherche pour recherche vos scans.</div>
                    )
                }

                {
                    !isLoading && !isError && data && data.recents.length > 0 && (
                        <div className="w-full px-3 mt-4">
                            <h2 className="text-xl font-bold mb-4">
                                Historique{" "}
                            </h2>
                            <div className=" flex gap-2 w-full overflow-x-auto no-scrollbar">
                                {
                                    data.recents.map((item, index) => (
                                        <RecentCard
                                            key={index}
                                            item={item}
                                            handleRead={handleRead}
                                            onDelete={() => handleDelete(item.title!, "recents", item.scanId!)}
                                        />
                                    )
                                    )
                                }
                            </div>
                        </div>
                    )}

                {
                    !isLoading && !isError && data && data.favourites.length > 0 && (
                        <div className="w-full px-3 mt-4">
                            <h2 className="text-xl font-bold mb-4">
                                Favoris
                            </h2>
                            <div className="w-full flex gap-2 overflow-x-auto no-scrollbar">
                                {
                                    data.favourites.map((item) => (
                                        <Card
                                            key={item.scanId}
                                            id={item.scanId!}
                                            parentId={
                                                item.scanParentId || ""
                                            }
                                            imgUrl={item.imgUrl!}
                                            title={item.title!}
                                            stars={item.stars}
                                            type="favourites"
                                            isProfile={true}
                                            onDelete={() => handleDelete(item.title!, "favourites", item.scanId!)}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    )
                }

                {
                    !isLoading && !isError && data && data.bookmarks.length > 0 && (
                        <div className="w-full px-3 mt-4">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                Watchlist
                            </h2>
                            <div className="flex w-full gap-2 overflow-x-auto no-scrollbar">
                                {
                                    data.bookmarks.map((item) => (
                                        <Card
                                            key={item.scanId}
                                            id={item.scanId!}
                                            imgUrl={item.imgUrl!}
                                            title={item.title!}
                                            parentId={
                                                item.scanParentId || ""
                                            }
                                            stars={item.stars}
                                            type="bookmarks"
                                            isProfile={true}
                                            onDelete={() => handleDelete(item.title!, "bookmarks", item.scanId!)}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    )}



            </div>
        </Page>
    )
}

export default ScanSearch