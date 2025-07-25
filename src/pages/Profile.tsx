import { Outlet, useNavigate } from "react-router-dom";
import {
    retrieveLaunchParams,
    openTelegramLink,
    copyTextToClipboard,
} from "@telegram-apps/sdk-react";
import { Page } from "../components/Page";
import { ScanResponse } from "../App";
import api from "../libs/api";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useAlert } from "../context/AlertContext";
import Tabs from "@/components/Tabs";
import { IoMdShareAlt } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";

export type Recent = Partial<ScanResponse> & { chap: string; chapName: string };

export type Fav = Omit<Recent, "chap">;
type UserInfo = {
    referralId: string;
    username: string;
    firstName: string;
    lastName: string;
    friends: number;
};

function Profile() {
    const { top } = useSafeArea();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;

    const APP_URL = import.meta.env.VITE_APP_URL;

    const fetchUserInfo = async () => {
        const { data, status } = await api.get(`/users?id=${user?.id}`);

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
        staleTime: 1000 * 60 * 10, // 5 minutes
        placeholderData: (previousData) => previousData
    });


    // useEffect(() => {
    //     const resetData = async () => {
    //         await cloudStorage.setItem("favourites", "");
    //         await cloudStorage.setItem("bookmarks", "");
    //         await cloudStorage.setItem("recents", "");

    //         console.log("Reset");
    //         alert("reset");
    //     };

    //     resetData();
    // }, []);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <Loading loadingText=" Chargement du profile..." />
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
                className="p-3 text-white lg:max-w-[700px] mx-auto relative flex flex-col gap-3"
                style={{
                    marginTop: showAlert ? 0 : top,
                }}
            >
                <div className="flex justify-between items-center">
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

                    <div className="flex-row gap-3 hidden">
                        <button
                            title="Partager"
                            className="cursor-pointer text-white hover:text-slate-400 transition-all duration-200"
                            onClick={() => { }}
                        >
                            <IoMdShareAlt size={25} />
                        </button>
                        <button
                            title="Parametre"
                            className="cursor-pointer text-white hover:text-slate-400 transition-all duration-200"
                            onClick={() => { }}
                        >
                            <IoSettingsOutline size={24} />
                        </button>
                    </div>
                </div>

                <div className="w-full space-y-3">
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
                            className="w-full bg-red-600 rounded-md py-2 px-1 cursor-pointer"
                        >
                            Share
                        </button>

                        <button
                            onClick={() =>
                                copyTextToClipboard(
                                    `${APP_URL}?startapp=ref_${userInfo?.referralId}`
                                )
                            }
                            className="w-full bg-red-600 rounded-md py-2 px-1 cursor-pointer"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <Tabs />
                <Outlet />
            </div>
        </Page>
    );
}

export default Profile;
