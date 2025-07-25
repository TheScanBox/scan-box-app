import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical, BsHandThumbsDownFill, BsHandThumbsUpFill } from "react-icons/bs";
import { IoMdThumbsUp, IoMdThumbsDown } from "react-icons/io";
import { CommentParamsType, CommentType } from "../pages/Comments";
import { formatDate } from "@/utils/dateFormat";
import useUser from "@/hooks/useUser";
import api from "@/libs/api";
import { useDeleteComment } from "@/hooks/comments/useDeleteComment";
import { useParams } from "react-router-dom";
import { useLikeComment } from "@/hooks/comments/useLikeComment";
import { useDislikeComment } from "@/hooks/comments/useDislikeComment";
import { openPopup } from "@telegram-apps/sdk-react";

type CommentProps = {
    handleOpenReplies?: (commentId: string) => void
    handleEditComment?: (commentId: string, content: string) => void
    onDelete?: () => void
    fromProfile?: boolean
} & CommentType;

const Comment = ({ content, date, id, user, dislikesCount, isLiked, likesCount, repliesCount, isDisliked, isReply, parentId, fromProfile = false, handleOpenReplies, handleEditComment, onDelete }: CommentProps) => {
    const [showOptions, setShowOptions] = useState(false);
    const [readMore, setReadMore] = useState(false);

    const optionRef = useRef<HTMLDivElement | null>(null);
    const currentUser = useUser()
    const params = useParams() as CommentParamsType

    const { mutateAsync: deleteComment } = useDeleteComment(params.scanId, params.chapterNumber);
    const { mutateAsync: likeComment } = useLikeComment(params.scanId, params.chapterNumber)
    const { mutateAsync: dislikeComment } = useDislikeComment(params.scanId, params.chapterNumber)

    const handleLike = async () => {
        if (user?.id == currentUser?.id) {
            alert("You can't like your own comment")
            return;
        }

        await likeComment({ commentId: id, fromProfile })
    };

    const handleDislike = async () => {
        if (user?.id == currentUser?.id) {
            alert("You can't dislike your own comment")
            return;
        }

        await dislikeComment({ commentId: id, fromProfile })
    };

    const handleEdit = (id: string) => {
        if (handleEditComment) {
            handleEditComment(id, content);
        }

        setShowOptions(false);
    }

    const handleDelete = async (id: string) => {

        setShowOptions(false);

        const buttonID = await openPopup({
            title: "Confirmation",
            message: "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
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
        }
        )

        if (buttonID == "delete") {
            await deleteComment({ commentId: id, fromProfile })

            if (!parentId && onDelete) {
                onDelete();
                return;
            }

            return;
        }

    };

    const handleReport = (id: string) => {
        // Logic to report the comment
        console.log(`Report comment with id: ${id}`);
        setShowOptions(false);
    };

    useEffect(() => {
        if (!showOptions) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (optionRef.current && !optionRef.current.contains(event.target as Node)) {
                setShowOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showOptions, optionRef]);

    return (
        <div
            className={`p-3 flex flex-col gap-2 border-t border-slate-700 ${isReply ? "ml-6" : ""}`}>
            <div className="flex items-center gap-2">
                <img
                    src={user?.avatar || "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/boruto.jpg"}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                />

                <div className="flex items-center w-full justify-between">
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
                            {user?.id == currentUser?.id && (
                                <span className="text-[0.6rem] text-slate-400">Vous</span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">{formatDate(date)}</p>
                    </div>
                    <div className="text-white cursor-pointer relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="p-1 hover:bg-slate-700 rounded-full cursor-pointer">
                            <BsThreeDotsVertical />
                        </button>
                        <div
                            ref={optionRef}
                            className={`${!showOptions && "hidden"} absolute right-1 mt-0.5 text-white text-sm bg-slate-700 w-36 rounded-md shadow-xl z-50`}
                        >
                            <ul className="divide-y-[0.5px] divide-gray-500">
                                {
                                    user?.id == currentUser?.id && // Assuming user?.id 1 is the owner of the comment
                                    <>
                                        <li
                                            onClick={() => handleEdit(id)}
                                            className="px-3 py-2 flex gap-1.5 truncate items-center hover:bg-gray-500 cursor-pointer rounded-t-md"
                                        >
                                            Modifier
                                        </li>
                                        <li
                                            onClick={() => handleDelete(id)}
                                            className="px-3 py-2 flex gap-1.5 truncate items-center hover:bg-gray-500 cursor-pointer"
                                        >
                                            Supprimer
                                        </li>
                                    </>
                                }
                                {user?.id != currentUser?.id && <li
                                    onClick={() => handleReport(id)}
                                    className={`px-3 text-red-600 py-2 flex gap-1.5 truncate items-center hover:bg-gray-500 cursor-pointer rounded-b-md ${user?.id == currentUser?.id ? "rounded-t-none" : "rounded-t-md"}`}
                                >
                                    Signalé
                                </li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="">
                <p className="text-sm text-white">
                    {readMore ? content : content.length > 200 ? `${content.slice(0, 200)}...` : content}
                    {content.length > 200 && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                setReadMore(!readMore);
                            }}
                            className="cursor-pointer text-red-400 text-xs"
                        >
                            {readMore ? " Voir Moins" : " Voir plus"}
                        </span>
                    )}
                </p>
            </div>

            <div className={`flex items-center ${isReply ? "justify-end" : "justify-between"}`}>
                <button
                    className={`${isReply && "hidden"} text-xs text-white cursor-pointer border border-slate-500 p-1`}
                    onClick={() => handleOpenReplies && handleOpenReplies(id + "")}
                >
                    {repliesCount! > 1 ? "Replies" : "Reply"} {repliesCount || ""}
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-1 text-xs border border-slate-500 p-1 cursor-pointer">
                        <IoMdThumbsUp className={`${isLiked ? "text-green-600" : user?.id == currentUser?.id ? "text-slate-600" : "text-slate-300"} cursor-pointer`} />
                        <span className={`${isLiked ? "text-green-600" : user?.id == currentUser?.id ? "text-slate-600" : "text-white"}`}>{likesCount}</span>
                    </button>
                    <button
                        onClick={handleDislike}
                        className="flex items-center gap-1 text-xs border border-slate-500 p-1 cursor-pointer">
                        <IoMdThumbsDown className={`${isDisliked ? "text-red-600" : user?.id == currentUser?.id ? "text-slate-600" : "text-slate-300"} cursor-pointer`} />
                        <span className={`${isDisliked ? "text-red-600" : user?.id == currentUser?.id ? "text-slate-600" : "text-white"}`}>{dislikesCount}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Comment