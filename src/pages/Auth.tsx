import {
    bindMiniAppCssVars,
    init,
    isFullscreen,
    isTMA,
    isViewportMounted,
    isViewportMounting,
    miniApp,
    miniAppReady,
    mountViewport,
    openPopup,
    requestFullscreen,
    retrieveLaunchParams,
    retrieveRawInitData,
    setMiniAppBackgroundColor,
    setMiniAppHeaderColor,
} from "@telegram-apps/sdk-react";
import Loading from "../components/Loading";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../context/AlertContext";

init();
miniAppReady();

const loadingMessages = [
    "Chargement des données...",
    "Récupération des chapitres...",
    "Téléchargement en cours...",
    "Préparation des scans...",
    "Mise à jour des mangas...",
    "Chargement des images...",
    "Récupération des pages...",
    "Traitement des données...",
    "Récupération des webtoons...",
    "Chargement des nouvelles histoires...",
];

const Auth = () => {
    const navigate = useNavigate();
    const hasMounted = useRef(false);

    const { setUnAvailable } = useAlert();

    const [index, setIndex] = useState(0);

    const mount = async () => {
        if (
            mountViewport.isAvailable() &&
            !isViewportMounted() &&
            !isViewportMounting()
        ) {
            if (!hasMounted.current) {
                hasMounted.current = true;
                await mountViewport();

                const { tgWebAppPlatform } = retrieveLaunchParams();

                if (
                    tgWebAppPlatform != "android" &&
                    tgWebAppPlatform != "ios"
                ) {
                    return;
                }

                setMiniAppHeaderColor.ifAvailable("#0f172a");
                setMiniAppBackgroundColor.ifAvailable("#0f172a");

                if (requestFullscreen.isAvailable() && !isFullscreen()) {
                    try {
                        await requestFullscreen();
                    } catch (error) {
                        alert(JSON.stringify(error));
                    }
                }
            }
        }
    };

    const auth = async () => {
        const { tgWebAppStartParam, tgWebAppData } = retrieveLaunchParams();
        const initDataRaw = retrieveRawInitData();
        const user = tgWebAppData?.user;

        const startParam = tgWebAppStartParam ? tgWebAppStartParam : "";
        const [command, payload] = startParam.split("_");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/users`,
                {
                    userId: user?.id,
                    inviterID: command == "ref" ? payload : "",
                    username: user?.username || "",
                    firstName: user?.first_name || "",
                    lastName: "",
                    isBot: user?.is_bot || false,
                    isPremium: user?.is_premium || false,
                    languageCode: user?.language_code || "en",
                },
                {
                    headers: {
                        Authorization: `Bearer ${initDataRaw}`,
                    },
                }
            );

            const token = res?.data?.token;

            if (res.status != 200 || !token) {
                await openPopup({
                    message: "Auth Failed. Veuillez reessayer plus tard.",
                });

                return;
            }

            sessionStorage.setItem("token", token);

            if (command == "read") {
                navigate(`/details/${payload}`, {
                    replace: true,
                });

                return;
            }

            navigate("/home", {
                replace: true,
            });
        } catch (error) {
            console.log(error);

            await openPopup({
                message: "Auth Failed. Veuillez reessayer plus tard.",
            });
        }
    };

    const checkMiniApp = async () => {
        const state = await isTMA("complete");

        return state;
    };

    useEffect(() => {
        const init = async () => {
            // const { tgWebAppPlatform } = retrieveLaunchParams();

            // if (tgWebAppPlatform != "android" && tgWebAppPlatform != "ios") {
            //     navigate("/not-allowed");

            //     return;
            // }

            const isMiniApp = await checkMiniApp();

            if (!isMiniApp) {
                navigate("/not-allowed");

                return;
            }

            if (
                miniApp.mount.isAvailable() &&
                !miniApp.isMounted() &&
                !miniApp.isMounting()
            ) {
                await miniApp.mount();
                await mount();
                await auth();

                // setUnAvailable(true);
            }

            if (bindMiniAppCssVars.isAvailable()) {
                miniApp.bindCssVars();
            }
        };

        init();
    }, []);

    useEffect(() => {
        const intervalID = setInterval(() => {
            const index = Math.floor(Math.random() * loadingMessages.length);

            setIndex(index);
        }, 3000);

        return () => clearInterval(intervalID);
    }, []);

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            <Loading />
            <p className="text-xs text-slate-400 mt-4">
                {loadingMessages[index]}
            </p>
        </div>
    );
};
export default Auth;
