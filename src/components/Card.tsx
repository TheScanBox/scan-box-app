import { CiStar } from "react-icons/ci";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useNavigate } from "react-router-dom";
import { IoIosTrash } from "react-icons/io";
import {
    openPopup,
    isPopupOpened,
    cloudStorage,
} from "@telegram-apps/sdk-react";

export type ResultItem = {
    imgUrl: string | undefined;
    title: string | undefined;
    scanId: string | undefined;
    stars: number | undefined;
};

type CardProps = {
    id: string;
    imgUrl: string;
    title: string;
    stars: number | string;
    helpPath?: string;
    isMore?: boolean;
    isProfile?: boolean;
    type?: "favourites" | "bookmarks";
    hideIds?: string[];
    setHideIds?: React.Dispatch<React.SetStateAction<string[]>>;
};

function Card({
    imgUrl,
    title,
    stars,
    id,
    helpPath,
    isMore = false,
    isProfile,
    type,
    hideIds,
    setHideIds,
}: CardProps) {
    const navigate = useNavigate();

    const handleDelete = async (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        e.stopPropagation();

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

        const results = (await cloudStorage.getItem(type)) as unknown as {
            [index: string]: string;
        };
        if (!results) return;

        const ResultsArr: ResultItem[] = JSON.parse(results[type]);

        const filteredResults = ResultsArr.filter(
            (result) => result.scanId != id
        );

        setHideIds?.((prev) => [...prev, `${type}_${id}`]);

        await cloudStorage.setItem(type, JSON.stringify([...filteredResults]));
    };

    return (
        <div
            className={`active:opacity-5 cursor-pointer ${
                isMore ? "w-full flex-1 " : "min-w-32 w-32"
            } ${hideIds?.includes(`${type}_${id}`) ? "hidden" : ""}`}
            onClick={() =>
                navigate(`${helpPath ? helpPath : ""}../details/${id}`)
            }
        >
            {/* <div
                className="w-full h-36 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${imgUrl})`,
                }}
            /> */}
            <div className="w-full h-40 relative">
                <LazyLoadImage
                    src={imgUrl}
                    className="w-full h-full object-cover object-center"
                    alt="img"
                    // placeholder={<img src="./loader.gif" />}
                    placeholder={
                        <div className="w-full h-full bg-slate-400 animate-pulse" />
                    }
                />
                <div className="absolute top-0 bottom-0 left-0 right-0 z-10" />
                {isProfile && (
                    <div
                        className="absolute top-2 right-2 z-20 hover:text-red-700"
                        onClick={handleDelete}
                    >
                        <IoIosTrash size={20} />
                    </div>
                )}
            </div>
            <div className="flex flex-col text-white text-xs mt-1 gap-1">
                <p className="truncate capitalize">{title}</p>
                <div className="flex justify-between items-center">
                    <div className="flex gap-1 items-center">
                        <CiStar color="yellow" />
                        <p>{stars}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;
