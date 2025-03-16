import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    cloudStorage,
    retrieveLaunchParams,
    openTelegramLink,
    copyTextToClipboard,
} from "@telegram-apps/sdk-react";
import { Card } from "../components";
import { Page } from "../components/Page";
import { ScanResponse } from "../App";
import api from "../libs/api";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import useSafeArea from "../hooks/useSafeArea";
import { IoMdClock } from "react-icons/io";

type Recent = Partial<ScanResponse> & { chap: string };

type Fav = Omit<Recent, "chap">;
type UserInfo = {
    referralId: string;
    username: string;
    firstName: string;
    lastName: string;
    friends: number;
};

function Profile() {
    const navigate = useNavigate();

    const [recent, setRecent] = useState<Recent[]>([]);
    const [favourites, setFavourites] = useState<Fav[]>([]);
    const [bookmarks, setBoomarks] = useState<Fav[]>([]);

    const { top, bottom } = useSafeArea();

    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;

    const APP_URL = import.meta.env.VITE_APP_URL;

    const fetchUserInfo = async () => {
        const { data, status } = await api.get(`/user?id=${user?.id}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const {
        data: userInfo,
        isLoading,
        error,
        refetch,
    } = useQuery<UserInfo, Error>({
        queryKey: ["profile"],
        queryFn: fetchUserInfo,
        staleTime: 600000,
    });

    const handleRead = (data: Recent) => {
        navigate(`../read/${data.scanId}/${data.chap}`, {
            state: {
                data,
            },
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            const favResults = (await cloudStorage.getItem(
                "favourites"
            )) as unknown as { [index: string]: string };
            const bookmarkResults = (await cloudStorage.getItem(
                "bookmarks"
            )) as unknown as { [index: string]: string };
            const recentResults = (await cloudStorage.getItem(
                "recents"
            )) as unknown as { [index: string]: string };

            if (favResults && favResults["favourites"] != "")
                setFavourites(JSON.parse(favResults["favourites"]));
            if (bookmarkResults && bookmarkResults["bookmarks"] != "")
                setBoomarks(JSON.parse(bookmarkResults["bookmarks"]));
            if (recentResults && recentResults["recents"] != "")
                setRecent(JSON.parse(recentResults["recents"]));
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <Loading />
                <p className="text-xs text-slate-400 mt-4">
                    Chargement des données...
                </p>
            </div>
        );
    }

    if (error && !isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-white lg:max-w-[700px] mx-auto">
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
        <Page>
            <div
                className="p-4 text-white h-screen pb-10 lg:max-w-[700px] mx-auto relative"
                style={{
                    marginTop: top,
                }}
            >
                <div className="flex gap-4 items-center mt-2">
                    <div className="w-24 h-24 rounded-full relative">
                        <img
                            src={user?.photo_url}
                            className="w-full h-full object-cover rounded-full"
                            alt={user?.first_name || ""}
                        />
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">
                            {user?.first_name}
                        </h1>
                        <p className="text-sm text-slate-500">
                            @{user?.username}
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-3 mt-3">
                    <h2 className="text-lg flex flex-row items-center gap-1">
                        Invite Link:{" "}
                        <span className="text-xs">
                            {userInfo?.friends || 0} Friends
                        </span>{" "}
                    </h2>
                    <p className=" bg-black/50 text-slate-300 p-3 truncate rounded-md text-sm">
                        {`${APP_URL}?startapp=ref_${userInfo?.referralId}`}
                    </p>
                    <div className="flex flex-row w-full justify-between gap-3">
                        <button
                            onClick={() => {
                                openTelegramLink(
                                    `https://t.me/share/url?text=${encodeURIComponent(
                                        `Lisez vos scans préférés gratuitement !\n\n${`${APP_URL}?startapp=ref_${userInfo?.referralId}`}`
                                    )}`
                                );
                            }}
                            className="w-full bg-red-600 rounded-md py-2 px-1"
                        >
                            Share
                        </button>

                        <button
                            onClick={() =>
                                copyTextToClipboard(
                                    `${APP_URL}?startapp=ref_${userInfo?.referralId}`
                                )
                            }
                            className="w-full bg-red-600 rounded-md py-2 px-1"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div
                    className="mt-5 flex flex-col gap-6"
                    style={{
                        paddingBottom: bottom,
                    }}
                >
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-4">
                            🕒 Historique{" "}
                        </h2>
                        <div className=" flex gap-2 w-full overflow-x-auto no-scrollbar">
                            {recent.length == 0 ? (
                                <p className="text-xs w-full text-center text-slate-500">
                                    Nothing yet
                                </p>
                            ) : (
                                recent.map((item, index) => (
                                    <div
                                        onClick={() => handleRead(item)}
                                        key={index}
                                        className="flex w-32 min-w-32 flex-col gap-2 text-white cursor-pointer"
                                    >
                                        <div
                                            className="w-32 h-36 bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url(${item.imgUrl})`,
                                            }}
                                        />
                                        {/* <img
                                            src={item.imgUrl}
                                            alt={item.title}
                                            className="w-32 h-36 object-cover"
                                        /> */}
                                        <div className="space-y-1">
                                            <p className="text-xs truncate capitalize">
                                                {item.title}
                                            </p>
                                            <p className="text-[0.6rem] truncate text-slate-400">
                                                CH {item.chap}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-4">
                            <span className="text-red-600">❤</span> Favoris
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
                                        imgUrl={item.imgUrl!}
                                        title={item.title!}
                                        stars={item.stars || "N/A"}
                                        helpPath="../"
                                    />
                                ))
                            )}
                        </div>
                    </div>

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
                                        stars={item.stars || "N/A"}
                                        helpPath="../"
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center w-full items-center">
                        <p className="text-slate-500 text-xs">
                            Made With <span className="text-red-600">❤</span> By{" "}
                            <span
                                className="underline font-bold"
                                onClick={() =>
                                    openTelegramLink("https://t.me/TheScanBox")
                                }
                            >
                                TheScanBox
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Page>
    );
}

export default Profile;
