import { FaHeart } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { IoLockClosed } from "react-icons/io5";

type ChapterItemProps = {
    img?: string;
    name?: string;
    chapterNum: number | null;
    isLiked?: boolean;
    isRead?: boolean;
    isLocked?: boolean;
};

function ChapterItem({ img, chapterNum, isLiked, isRead, isLocked }: ChapterItemProps) {
    if (!chapterNum || chapterNum <= 0) return;

    return (
        <div className={`w-full flex items-center justify-between px-3 py-1 ${isRead && "bg-slate-900/40"}`}>
            <div className="flex items-center gap-2 h-11">
                <div
                    className="h-full w-11 rounded-md bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${img || ""})`,
                    }}
                />
                {/* <img
                src={img}
                alt={`${name}-${chapterNum}`}
                className="h-full w-11 object-cover rounded-md"
            /> */}
                <p className="text-white">Chapitre {chapterNum}</p>
            </div>
            <div className="flex items-center gap-2">
                <IoLockClosed
                    size={18}
                    className={`text-slate-300 ${!isLocked && "hidden"}`}
                />
                <div className={`${!isLiked && "hidden"} flex items-center gap-1`}>
                    {/* <span className="text-white text-xs">100</span> */}
                    <FaHeart
                        size={18}
                        className={`text-red-600 `}
                    />
                </div>
                <IoIosArrowForward
                    color="white"
                    className="font-bold"
                    size={18}
                />
            </div>
        </div>
    );
}

export default ChapterItem;
