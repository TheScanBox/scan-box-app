import { IoIosArrowDropleft, IoIosArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";
import { useSafeArea } from "@/context/SafeAreaContext";
import ScrollToTop from "./ScrollToTop";
import { useEffect, useState } from "react";

import { hapticFeedback } from "@telegram-apps/sdk";
import { useNavigate } from "react-router-dom";
import useGetCommentCount from "@/hooks/comments/useGetCommentCount";
import { StateType } from "@/pages/ScanLecture";
import useGetChapterLikesCount from "@/hooks/chapterLikes/useGetChapterLikesCount";
import useUpdateChapterLike from "@/hooks/chapterLikes/useUpdateChapterLike";
import useUser from "@/hooks/useUser";
import Tooltip from "./Tooltip";

type ScanLectureControlsBottomProps = {
    numChap: number;
    showControls: boolean;
    setSelectedChap: React.Dispatch<React.SetStateAction<string>>;
    selectedChap: string;
    visible: boolean;
    handleScroll: () => void;
    scanId: string,
    chapterNumber: string
    parentId?: string;
    state: StateType;
    showTip?: boolean;
};

const ScanLectureControlsBottom = ({
    numChap,
    showControls,
    setSelectedChap,
    selectedChap,
    visible,
    handleScroll,
    scanId,
    parentId,
    chapterNumber,
    state,
    showTip = false
}: ScanLectureControlsBottomProps) => {
    const navigate = useNavigate();
    const { bottom } = useSafeArea();
    const user = useUser();

    const { isLoading, commentCount } = useGetCommentCount(scanId, chapterNumber);
    const { isLoading: isLoadingLikesCount, data: likesCountData } = useGetChapterLikesCount(scanId, chapterNumber);
    const { mutateAsync: updateChapterLike } = useUpdateChapterLike()
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (likesCountData) {
            setIsLiked(likesCountData.liked);
        }
    }, [likesCountData]);

    const handleLike = async () => {
        if (hapticFeedback.impactOccurred.isAvailable()) {
            // hapticFeedback.selectionChanged();
            hapticFeedback.impactOccurred("medium");
        }

        // setIsLiked((prev) => !prev);
        await updateChapterLike({
            scanId,
            chapterNumber: parseInt(chapterNumber),
            userId: user?.id || 0,
            liked: !isLiked
        })
    };

    const handleReadComments = () => {
        if (hapticFeedback.impactOccurred.isAvailable()) {
            hapticFeedback.impactOccurred("medium");
        }

        // () => navigate(`../../../comments/${scanId}/${chapterNumber}`)

        navigate(`/comments/${scanId}/${chapterNumber}`, {
            state: {
                scanId,
                chapterNumber,
                parentId,
                currentState: state,
            },
            replace: true,
        });
    };

    const handleNavigate = (delta: number) => {
        const newSelectedChap = Number(selectedChap) + delta;

        if (newSelectedChap <= 0) {
            setSelectedChap("1");
            return;
        }

        if (newSelectedChap > numChap) {
            setSelectedChap(String(numChap));
            return;
        }

        setIsLiked(false);
        setSelectedChap(newSelectedChap.toString());
    };

    return (
        <div
            style={{
                paddingBottom: bottom ? bottom : "1rem",
            }}
            className={`${showControls ? "show-controls" : "hidden"
                } w-full items-center justify-between text-white select-none font-light fixed bottom-0 bg-black/90 p-3 z-30`}
        >
            <ScrollToTop visible={visible} handleScroll={handleScroll} />
            <p className="text-[10px] text-slate-400 hidden">
                Tapez 2 fois pour afficher.
            </p>

            <div className="gap-4 items-center flex">
                <div
                    onClick={handleLike}
                    className="flex gap-1 items-center cursor-pointer">
                    <FaHeart
                        size={26}
                        className={`${isLiked ? "text-red-600" : "text-white"
                            }`}

                    />
                    {isLoadingLikesCount ? (
                        <span className="text-xs">...</span>
                    ) : (
                        <span className="text-xs">
                            {likesCountData?.likeCount || 0}
                        </span>
                    )}

                </div>

                <div
                    onClick={handleReadComments}
                    className="flex gap-1 items-center cursor-pointer relative">
                    <Tooltip
                        text="Laissez un commentaire"
                        show={showTip}
                    />
                    <BiCommentDetail size={26} className="text-white" />
                    {isLoading ? (
                        <span className="text-xs">...</span>
                    ) : (
                        <span className="text-xs">{commentCount}</span>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    className="outline-none cursor-pointer"
                    disabled={Number(selectedChap) == 1}
                    onClick={() => handleNavigate(-1)}
                >
                    <IoIosArrowDropleft size={28} />
                </button>
                <button
                    className="outline-none cursor-pointer"
                    disabled={Number(selectedChap) == numChap}
                    onClick={() => handleNavigate(1)}
                >
                    <IoIosArrowDropright size={28} />
                </button>
            </div>
        </div>
    );
};

export default ScanLectureControlsBottom;
