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
import api from "../libs/api";
import { useQueryClient } from "@tanstack/react-query";

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
    const queryClient = useQueryClient();

    const { setShowAlert } = useAlert();

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

        let startParam = tgWebAppStartParam ? tgWebAppStartParam : "";

        const isSpecialPath = startParam.includes("scan_");
        if (isSpecialPath) startParam = startParam.replace("scan_", "scan-");

        let [command, payload, chap] = startParam.split("_");

        if (isSpecialPath) payload = payload.replace("scan-", "scan_");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth`,
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
                if (chap) {
                    try {
                        const { data, status } = await api.get(
                            `/scans/${payload}`
                        );

                        if (status != 200) {
                            throw new Error("Network response was not ok");
                        }

                        queryClient.setQueryData([`scan_${payload}`], data);

                        const path = data.scanParentId
                            ? `/read/${payload}/${chap}/${data.scanParentId}`
                            : `/read/${payload}/${chap}`;

                        navigate(path, {
                            state: {
                                data: {
                                    imgUrl: data.imgUrl,
                                    title: data.title,
                                    scanId: data.scanId,
                                    scanPath: data.scanPath,
                                    scanParentId: data?.scanParentId,
                                },
                            },
                            replace: true,
                        });
                    } catch (error) {
                        console.log(error);

                        navigate(`/home`, {
                            replace: true,
                        });
                    }

                    return;
                }

                let parentId = "";

                if (payload.toLowerCase().startsWith("scan")) {
                    const { data, status } = await api.get(`/scans/${payload}`);

                    if (status != 200) {
                        throw new Error("Network response was not ok");
                    }

                    parentId = data.scanParentId || "";
                }

                navigate(`/details/${payload}/${parentId}`, {
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
            const { tgWebAppPlatform } = retrieveLaunchParams();

            if (
                tgWebAppPlatform != "android" &&
                tgWebAppPlatform != "ios" &&
                import.meta.env.VITE_APP_ENV != "development"
            ) {
                navigate("/not-allowed");

                return;
            }

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

                // setShowAlert(true);
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
