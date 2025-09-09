import { useState, useEffect, useRef } from "react";
import { ScanImage } from "../components/ScanLoader";
import { ScanResponse } from "../App";
import { useUserScans } from "./useUserScans";
import { RecentScan } from "@/types";
import useUser from "./useUser";
import { cloudStorage } from "@telegram-apps/sdk-react";

type StateType = {
    chapData:
    | {
        [index: string]: number;
    }
    | undefined;
    data: ScanResponse & {
        chap?: string;
    };
    allChapters: {
        [index: string]: number;
    }[];
};

type useFetchImagesType = {
    state: StateType;
    id: string;
    selectedChap: string;
    allChapters: { [index: string]: number }[];
    chapData: { [index: string]: number } | undefined;
};

// id = param.id

const useFetchImages = ({
    state,
    id,
    selectedChap,
    allChapters,
    chapData,
}: useFetchImagesType) => {
    const [images, setImages] = useState<ScanImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [chapterName, setChapterName] = useState<number>();

    const hasUpdatedRef = useRef(false);

    const user = useUser()
    const { addScan, updateScan, getScanItem, data } = useUserScans(user?.id?.toString());

    useEffect(() => {
        const updateData = async () => {
            if (!data) return;
            if (!id) return;
            if (!selectedChap) return;
            if (hasUpdatedRef.current) return;
            if (!state?.data) return;

            const itemInList = getScanItem("recents", id) as RecentScan | undefined;

            await cloudStorage.setItem(`selectedChap-${id}`, selectedChap);

            if (itemInList) {
                if (!chapterName) return;
                if (parseInt(selectedChap) === itemInList.chapterNumber) return;

                await updateScan({
                    type: "recents",
                    data: {
                        scanId: id,
                        chapterNumber: parseInt(selectedChap),
                        chapterName: String(chapterName ?? ""),
                        lastReadAt: new Date().toISOString(),
                    },
                });

                if (!hasUpdatedRef.current) {
                    hasUpdatedRef.current = true;
                    console.log("updated recent");
                }

                return;
            }

            if (!user?.id) return;

            await addScan({
                type: "recents",
                data: {
                    scanId: id,
                    scanParentId: state?.data.scanParentId,
                    scanPath: state?.data.scanPath,
                    title: state?.data.title,
                    imgUrl: state?.data.imgUrl,
                    userId: String(user?.id),
                    chapterNumber: parseInt(selectedChap),
                    chapterName: String(chapterName ?? ""),
                    lastReadAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    stars: state?.data.stars,
                } as RecentScan,
            })

            if (!hasUpdatedRef.current) {
                hasUpdatedRef.current = true;
            }
        };

        updateData();
    }, [data, selectedChap, id, chapterName, user?.id]);

    useEffect(() => {
        if (!state?.allChapters && !allChapters) return;
        let all = state?.allChapters ? state?.allChapters : allChapters;

        if (!all) return;

        const index = Number(selectedChap) - 1;
        const [chapName]: number[] = Object.values(all[index]);

        let pages: ScanImage[] = [];

        if (!id) return;

        if (!state?.chapData && !chapData) return;

        const newChapData = state?.chapData ? state?.chapData : chapData;

        if (!newChapData) return;

        if (state?.data && state?.data.scanPath) {
            for (let i = 1; i <= newChapData?.[selectedChap!]; i++) {
                pages.push({
                    id: i,
                    url: `${import.meta.env.VITE_ANIME_SAMA_DOMAIN}/s2/scans/${state.data.scanPath}/${selectedChap}/${i}.jpg`,
                });
            }
        }

        const firstImage = new Image();

        firstImage.onload = function () {
            setLoading(false);
        };

        firstImage.onerror = function () {
            setLoading(false);
            // setError(true);
        };

        firstImage.src = pages[0]?.url;

        setLoading(true);
        setImages(pages);
        setChapterName(chapName);

        hasUpdatedRef.current = false;

    }, [selectedChap, state?.data, chapData, allChapters]);

    return { loading, images, chapterName };
};
export default useFetchImages;
