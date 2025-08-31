import { Card, CardsContainer } from "@/components";
import Loading from "@/components/Loading";
import { Page } from "@/components/Page";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useFetchUserByRefId } from "@/hooks/useFetchUserByRefId";
import { useUserScans } from "@/hooks/useUserScans";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { RecentCard } from "./tabs/Scans";
import { RecentScan } from "@/types";

const User = () => {
    const { refId } = useParams<{ refId: string }>();
    const { top, bottom } = useSafeArea()
    const navigate = useNavigate();

    const { user, loading, error } = useFetchUserByRefId(refId || "");
    const { isLoading, isError, data, refetch } = useUserScans(user?.userId || "");

    const handleRead = (data: RecentScan) => {
        const path = data.scanParentId
            ? `../read/${data.scanId}/${data.chapterNumber}/${data.scanParentId}?source=user`
            : `../read/${data.scanId}/${data.chapterNumber}?source=user`;

        navigate(path, {
            state: {
                data,
            },
        });
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <Loading loadingText="Chargement du profile..." />
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <p className="text-sm text-center text-red-500">Une erreur est survenue lors du chargement du profil.</p>
                <button
                    className="bg-blue-600 px-3 py-2 rounded-lg mt-2 text-sm text-white"
                    onClick={() => navigate("/home")}
                >
                    Back Home
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <p className="text-lg text-center text-red-500">Utilisateur non trouvé.</p>
                <button
                    className="bg-blue-600 px-3 py-2 rounded-lg mt-2 text-xs text-white cursor-pointer hover:bg-blue-700 transition-all duration-200"
                    onClick={() => navigate("/home")}
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <Page>
            <div
                className="text-white md:max-w-[700px] mx-auto relative flex flex-col gap-1"
                style={{
                    marginTop: top ? top : 0,
                    marginBottom: bottom + 16
                }}
            >
                <div className="flex flex-col gap-3 items-center justify-center w-full pt-3">
                    <div className="flex justify-end w-full px-5">
                        <button onClick={() => alert("Bientôt disponible !")}>
                            <IoSearchOutline
                                size={24}
                                className="cursor-pointer font-bold"
                            />
                        </button>
                    </div>
                    <div className="w-28 h-28 rounded-full relative">
                        <img
                            src={user?.avatar}
                            className="w-full h-full object-cover rounded-full"
                            alt={user?.firstName || ""}
                        />
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold truncate">
                            {user?.firstName} {user?.lastName}
                        </h1>
                        {/* <p className="text-xs text-slate-500">
                            {user?.username ? `@${user.username}` : "No username"}
                        </p> */}
                    </div>

                    <div className="bg-slate-900/60 px-3 py-3 w-full text-slate-300 hidden">
                        <p className="text-sm font-bold">Bio</p>
                        <p className="text-xs mt-1 w-full">
                            {user?.bio || "Aucune bio pour le moment."}
                        </p>
                    </div>
                </div>

                <div className="w-full px-3">
                    {isLoading && (
                        <div className="flex flex-col justify-center items-center mt-2">
                            <Loading
                                loadingText="Chargement..."
                                className="w-4 h-4"
                            />
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col justify-center items-center mt-2">
                            <p className="text-sm text-red-500">Une erreur est survenue lors du chargement des scans.</p>
                            <button className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm" onClick={() => refetch()}>
                                Réessayer
                            </button>
                        </div>
                    )}

                    {!isLoading && data && (
                        <div className="flex flex-col gap-6 mt-5">
                            {!!data.favourites.length && (<div className="w-full">
                                <h2 className="text-2xl font-bold mb-4">
                                    <span className="text-red-600">❤</span>{" "}
                                    Favoris
                                </h2>
                                <div className="w-full flex gap-2 overflow-x-auto no-scrollbar">
                                    {data.favourites.length == 0 ? (
                                        <p className="text-xs w-full text-center text-slate-500">
                                            A list of favourite scan
                                        </p>
                                    ) : (
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
                                                isUser={true}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                            )}

                            {!!data.bookmarks.length && (<div className="w-full">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    📺 Watchlist
                                </h2>
                                <div className="flex w-full gap-2 overflow-x-auto no-scrollbar">
                                    {data.bookmarks.length == 0 ? (
                                        <p className="text-xs w-full text-center text-slate-500">
                                            Add scan to read later
                                        </p>
                                    ) : (
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
                                                isUser={true}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                            )}

                            {!!data.recents.length && (<div className="w-full">
                                <h2 className="text-2xl font-bold mb-4">
                                    🕒 Historique{" "}
                                </h2>
                                <div className=" flex gap-2 w-full overflow-x-auto no-scrollbar">
                                    {data.recents.length == 0 ? (
                                        <p className="text-xs w-full text-center text-slate-500">
                                            Nothing yet
                                        </p>
                                    ) : (
                                        data.recents.map((item, index) => (
                                            <RecentCard
                                                key={index}
                                                item={item}
                                                isProfile={false}
                                                handleRead={handleRead}
                                            />
                                        )
                                        )
                                    )}
                                </div>
                            </div>
                            )}

                            {!data.recents.length && !data.favourites.length && !data.bookmarks.length && (
                                <div className="flex flex-col justify-center items-center mt-2">
                                    <p className="text-sm text-center text-slate-400">Aucune activité récente.</p>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>
        </Page>
    )
}

export default User