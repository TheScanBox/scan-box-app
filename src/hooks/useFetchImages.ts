import { useState, useEffect } from "react";
import { ScanImage } from "../components/ScanLoader";
import { ScanResponse } from "../App";
import { useUserScans } from "./useUserScans";
import { RecentScan } from "@/types";
import useUser from "./useUser";

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

    const user = useUser()
    const { addScan, updateScan, getScanItem, data } = useUserScans(user?.id?.toString());

    useEffect(() => {
        const updateData = async () => {
            if (!data) return;
            if (!id) return;
            if (!selectedChap) return;

            const itemInList = getScanItem("recents", id) as RecentScan | undefined;

            if (itemInList) {
                if (itemInList.chapterNumber == parseInt(selectedChap)) return;
                if (!chapterName) return;

                await updateScan({
                    type: "recents",
                    data: {
                        scanId: id,
                        chapterNumber: parseInt(selectedChap),
                        chapterName: chapterName?.toString() || "",
                        lastReadAt: new Date().toISOString(),
                    },
                });
                return;
            }

            if (!user?.id) return;

            await addScan({
                type: "recents",
                data: {
                    scanId: id,
                    scanParentId: state.data.scanParentId,
                    scanPath: state.data.scanPath,
                    title: state.data.title,
                    imgUrl: state.data.imgUrl,
                    userId: String(user?.id),
                    chapterNumber: parseInt(selectedChap),
                    chapterName: chapterName?.toString() || "",
                    lastReadAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    stars: state.data.stars,
                } as RecentScan,
            })
        };

        updateData();
    }, [data, selectedChap, id, chapterName, getScanItem, user?.id]);

    useEffect(() => {
        if (!state.allChapters && !allChapters) return;
        let all = state?.allChapters ? state?.allChapters : allChapters;

        if (!all) return;

        const index = Number(selectedChap) - 1;
        const [chapName]: number[] = Object.values(all[index]);

        let pages: ScanImage[] = [];

        if (!id) return;

        if (!state?.chapData && !chapData) return;

        const newChapData = state?.chapData ? state?.chapData : chapData;

        if (!newChapData) return;

        for (let i = 1; i <= newChapData?.[selectedChap!]; i++) {
            pages.push({
                id: i,
                url: `https://anime-sama.fr/s2/scans/${state.data.scanPath}/${selectedChap}/${i}.jpg`,
            });
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

        // setPageUrls(pages);
        setLoading(true);
        setImages(pages);
        setChapterName(chapName);

    }, [selectedChap, state.data, chapData, allChapters]);

    return { loading, images, chapterName };
};
export default useFetchImages;
