import { cloudStorage } from "@telegram-apps/sdk-react";
import { useState, useEffect } from "react";
import { ScanImage } from "../components/ScanLoader";
import { ScanResponse } from "../App";
import { useUserScans } from "./useUserScans";

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

    const { updateState } = useUserScans();

    useEffect(() => {
        if (!state.allChapters && !allChapters) return;
        let all = state?.allChapters ? state?.allChapters : allChapters;

        if (!all) return;

        const index = Number(selectedChap) - 1;
        const [chapName]: number[] = Object.values(all[index]);

        const updateData = async () => {
            await cloudStorage.setItem(`selectedChap-${id}`, selectedChap);

            await updateState({
                type: "recents",
                data: {
                    imgUrl: state.data?.imgUrl,
                    title: state.data?.title,
                    chap: selectedChap,
                    chapName: chapName.toString() || "",
                    scanId: state.data.scanId,
                    scanParentId: state.data.scanParentId,
                    scanPath: state.data.scanPath,
                },
            });
        };

        let pages: ScanImage[] = [];

        if (!id) return;

        if (!state?.chapData && !chapData) return;

        const newChapData = state?.chapData ? state?.chapData : chapData;

        if (!newChapData) return;

        for (let i = 1; i <= newChapData?.[`eps${selectedChap!}`]; i++) {
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

        updateData();
    }, [selectedChap, state.data, chapData, allChapters]);

    return { loading, images, chapterName };
};
export default useFetchImages;
