import { CiStar } from "react-icons/ci";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import { IoIosTrash } from "react-icons/io";
import { useUserScans } from "@/hooks/useUserScans";

export type ResultItem = {
    imgUrl: string | undefined;
    title: string | undefined;
    scanId: string | undefined;
    stars: number | undefined;
};

type CardProps = {
    id: string;
    parentId: string;
    imgUrl: string;
    title: string;
    stars?: number | string;
    isMore?: boolean;
    isProfile?: boolean;
    isUser?: boolean;
    type?: "favourites" | "bookmarks";
    onDelete?: () => void
};

function Card({
    imgUrl,
    title,
    stars,
    id,
    parentId,
    isMore = false,
    isUser = false,
    isProfile,
    onDelete
}: CardProps) {
    const navigate = useNavigate();

    return (
        <div
            className={`active:opacity-5 cursor-pointer ${isMore ? "w-full flex-1" : "min-w-32 w-32"}`}
            onClick={() =>
                navigate(
                    `/details/${id}/${parentId}${isUser ? "?source=user" : ""}`,
                )
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
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.()
                        }}
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
                        <p>
                            {stars ? parseFloat(`${stars}`)?.toFixed(1) : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;
