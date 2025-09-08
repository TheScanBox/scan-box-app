import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    retrieveLaunchParams,
    copyTextToClipboard,
    shareURL
} from "@telegram-apps/sdk-react";
import { Page } from "../components/Page";
import api from "../libs/api";
import { useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useAlert } from "../context/AlertContext";
import Tabs from "@/components/Tabs";
import { IoMdShareAlt } from "react-icons/io";
import { IoSettingsOutline, IoSearchOutline } from "react-icons/io5";
import { useMemo } from "react";

type UserInfo = {
    referralId: string;
    username: string;
    firstName: string;
    lastName: string;
    friends: number;
};

export type PageType = {
    title: string;
    type: "scans" | "comments" | "subscriptions";
};

function Profile() {
    const { top } = useSafeArea();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const location = useLocation();

    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;
    const page = useMemo<PageType>(() => {
        switch (location.pathname) {
            case "/profile/comments":
                return { title: "Mes Commentaires", type: "comments" };
            case "/profile/subscriptions":
                return { title: "Mes Abonnements", type: "subscriptions" };
            default:
                return { title: "Mes Scans", type: "scans" };
        }
    }, [location.pathname]);

    const APP_URL = import.meta.env.VITE_APP_URL;

    const fetchUserInfo = async () => {
        const { data, status } = await api.get(`/users/me`);

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

    const handleShareProfile = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;
        shareURL(`${APP_URL}?startapp=profile_${userInfo?.referralId}`, "\nDécouvrez mon profil sur ScanBox 🔥")
    };

    const handleShareReferral = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;
        shareURL(`${APP_URL}?startapp=ref_${userInfo?.referralId}`, "\nLisez vos scans préférés gratuitement !")
    };

    const handleOpenSettings = () => {
        navigate("/settings");
    };


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
            <Page>
                <div className="w-full h-screen flex flex-col justify-center items-center">
                    <Loading loadingText="Chargement du profile..." />
                </div>
            </Page>
        );
    }

    if (error && !isLoading) {
        return (
            <Page>
                <div className="h-screen flex flex-col items-center justify-center text-white md:max-w-[700px] mx-auto">
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
            </Page>
        );
    }

    return (
        <Page>
            <div
                className="text-white md:max-w-[700px] mx-auto relative flex flex-col gap-3 select-none sm:w-screen"
                style={{
                    marginTop: showAlert ? 0 : top,
                }}
            >

                <div className="flex justify-between items-center w-full gap-3 p-3">
                    <div className="flex gap-4 items-center mt-2 w-full ">
                        <div className="w-24 h-24 min-w-24 min-h-24 rounded-full relative bg-slate-700">
                            <img
                                src={user?.photo_url}
                                className="w-full h-full object-cover rounded-full"
                                alt={user?.first_name || ""}
                            />
                            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full" />
                        </div>

                        <div className="flex flex-col flex-1 w-10">
                            <h1 className="text-2xl font-bold truncate">
                                {user?.first_name}
                            </h1>
                            <p className="text-sm text-slate-500">
                                @{user?.username}
                            </p>
                        </div>
                    </div>

                    <div className="flex-row gap-3 flex">
                        <button
                            title="Recherche"
                            className="cursor-pointer text-white hover:text-slate-400 active:text-slate-400 transition-all duration-200"
                            onClick={() => {
                                navigate(`/search/${page.type}`);
                            }}
                        >
                            <IoSearchOutline size={24} />
                        </button>

                        <button
                            title="Partager"
                            className="cursor-pointer text-white hover:text-slate-400 active:text-slate-400 transition-all duration-200"
                            onClick={handleShareProfile}
                        >
                            <IoMdShareAlt size={25} />
                        </button>

                        <button
                            title="Parametre"
                            className="cursor-pointer text-white hover:text-slate-400 active:text-slate-400 transition-all duration-200"
                            onClick={handleOpenSettings}
                        >
                            <IoSettingsOutline size={24} />
                        </button>

                    </div>
                </div>

                <div className="w-full space-y-3 px-3">
                    <h2 className="text-lg flex flex-row items-center gap-1">
                        Invite Link:{" "}
                        <span className="text-xs">
                            {userInfo?.friends || 0} Friend{(userInfo?.friends || 0) > 1 && "s"}
                        </span>{" "}
                    </h2>
                    <p className=" bg-black/50 text-slate-300 p-3 truncate rounded-md text-sm">
                        {`${APP_URL}?startapp=ref_${userInfo?.referralId}`}
                    </p>
                    <div className="flex flex-row w-full justify-between gap-3">
                        <button
                            onClick={handleShareReferral}
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
