import { IoIosArrowForward } from "react-icons/io";

type ChapterItemProps = {
    img?: string;
    name?: string;
    chapterNum: number | null;
};

function ChapterItem({ img, chapterNum }: ChapterItemProps) {
    if (!chapterNum || chapterNum <= 0) return;

    return (
        <div className="h-11 w-full flex items-center justify-between">
            <div className="flex h-full items-center gap-2">
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
                <p className="text-white">Chapiter {chapterNum}</p>
            </div>
            <div>
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
