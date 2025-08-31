import Loading from "@/components/Loading";
import { useGetCommentsByUserId } from "@/hooks/comments/useGetCommentsByUserId"
import useUser from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { formatDate } from "@/utils/dateFormat";
import { IoMdThumbsDown, IoMdThumbsUp } from "react-icons/io";
import ProfileRepliesContainer from "@/components/ProfileRepliesContainer";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useLocation } from "react-router-dom";
import { CommentType } from "@/types";

type UserCommentType = {
    scan: {
        id: string;
        scanId: string;
        title: string;
    }
} & CommentType

const Comments = () => {
    const user = useUser();
    const { inView, ref } = useInView({
        threshold: 0.1,
    });
    const { search } = useLocation();
    const { bottom } = useSafeArea()
    const { isLoading, isFetching, isError, refetch, fetchNextPage, hasNextPage, data: comments } = useGetCommentsByUserId<UserCommentType[]>(user?.id);

    const [open, setOpen] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

    const handleOpenReplies = () => { }

    useEffect(() => {
        const params = new URLSearchParams(search);
        const commentId = params.get("commentId");

        if (commentId) {
            setSelectedCommentId(commentId);
            setOpen(true);
        } else {
            setSelectedCommentId(null);
            setOpen(false);
        }
    }, [search]);

    useEffect(() => {
        if (inView && !isLoading && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, isLoading]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center mt-2">
                <Loading
                    loadingText="Chargement..."
                    className="w-5 h-5"
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center mt-2">
                <p className="text-xs text-red-500 text-center">Une erreur est survenue lors du chargement des commentaires.</p>
                <button
                    className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm"
                    onClick={() => refetch()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (comments?.pages.flat().length === 0 && search === "") {
        return (
            <div className="flex justify-center items-center">
                <p className="text-xs text-center text-slate-400 px-3">Vous n'avez laissé aucun commentaire pour le moment. La liste de vos commentaires s'affichera ici.</p>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col gap-4 px-3"
            style={{ paddingBottom: bottom + 16 }}
        >
            {comments?.pages.flat().map((comment) => (
                <div
                    key={comment.id}
                    className={`flex flex-col gap-2 border-t border-slate-700 pt-2 cursor-pointer`}
                    onClick={() => {
                        setOpen(true)
                        setSelectedCommentId(comment.parentId ? comment.parentId : comment.id)
                    }}
                >
                    <h2 className="text-sm font-semibold capitalize">{comment?.scan?.title || "Unknown"} - #{comment.chapterNumber}</h2>
                    {comment.parentId && <span className="text-xs text-slate-400 block -mt-2">Réponse à {comment.parentId ? `#${comment.parentId}` : "un commentaire"}</span>}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-white flex gap-1 items-center">
                            {comment.parentId && <MdSubdirectoryArrowRight />}
                            {comment.content}
                        </p>
                        <p className="text-xs text-slate-400">{formatDate(comment.createdAt || "")}</p>
                    </div>

                    <div className={`flex items-center ${comment.parentId ? "justify-end" : "justify-between"}`}>
                        <button
                            className={`${comment.parentId && "hidden"} text-xs text-white cursor-pointer border border-slate-500 p-1`}
                            onClick={() => handleOpenReplies && handleOpenReplies()}
                        >
                            {comment.repliesCount! > 1 ? "Replies" : "Reply"} {comment.repliesCount || ""}
                        </button>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => alert("You can't like/dislike your own comment")}
                                className="flex items-center gap-1 text-xs border border-slate-500 p-1 cursor-pointer">
                                <IoMdThumbsUp className={`${comment.isLiked ? "text-green-600" : comment.user.id == user?.id ? "text-slate-600" : "text-slate-300"} cursor-pointer`} />
                                <span className={`${comment.isLiked ? "text-green-600" : comment.user.id == user?.id ? "text-slate-600" : "text-white"}`}>{comment.likesCount}</span>
                            </button>
                            <button
                                onClick={() => alert("You can't like/dislike your own comment")}
                                className="flex items-center gap-1 text-xs border border-slate-500 p-1 cursor-pointer">
                                <IoMdThumbsDown className={`${comment.isDisliked ? "text-red-600" : comment.user.id == user?.id ? "text-slate-600" : "text-slate-300"} cursor-pointer`} />
                                <span className={`${comment.isDisliked ? "text-red-600" : comment.user.id == user?.id ? "text-slate-600" : "text-white"}`}>{comment.dislikesCount}</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <ProfileRepliesContainer
                open={open}
                setOpen={setOpen}
                commentId={selectedCommentId}
            />

            <div
                ref={ref}
                className="w-full min-h-5"
                style={{ paddingBottom: bottom }}
            >

                {isFetching && (
                    <div className="flex justify-center items-center mt-3">
                        <Loading loadingText="Chargement..." />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Comments