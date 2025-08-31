import {
    Drawer,
    DrawerContent,
    DrawerTitle,
} from "@/components/ui/drawer"
import { IoMdClose } from "react-icons/io";
import Comment from "./Comment"
import CommentInput from "./CommentInput";
import { CommentParamsType } from "@/pages/Comments";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/libs/api";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useSafeArea } from "@/context/SafeAreaContext";
import { CommentType } from "@/types";

type RepliesContainerType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    commentId?: string;
    comment?: CommentType
}

// const replies = [
//     {
//         id: 1,
//         user: { id: 1, name: "User1" },
//         date: "May 10, 2021",
//         content: "This is a reply.",
//         repliesCount: 0,
//         likesCount: 2,
//         dislikesCount: 0,
//         isLiked: true,
//         isReply: true,
//     },
//     {
//         id: 2,
//         user: { id: 2, name: "User2" },
//         date: "May 11, 2021",
//         content: "This is another reply.",
//         repliesCount: 0,
//         likesCount: 3,
//         dislikesCount: 1,
//         isDisliked: true,
//         isReply: true,
//     },
//     {
//         id: 3,
//         user: { id: 3, name: "User3" },
//         date: "May 12, 2021",
//         content: "Yet another reply.",
//         repliesCount: 0,
//         likesCount: 1,
//         dislikesCount: 0,
//         isReply: true,
//     },
//     {
//         id: 4,
//         user: { id: 3, name: "User3" },
//         date: "May 12, 2021",
//         content: "Yet another reply.",
//         repliesCount: 0,
//         likesCount: 1,
//         dislikesCount: 0,
//         isReply: true,
//     },
//     {
//         id: 5,
//         user: { id: 3, name: "User3" },
//         date: "May 12, 2021",
//         content: "Yet another reply.",
//         repliesCount: 0,
//         likesCount: 1,
//         dislikesCount: 0,
//         isReply: true,
//     }
// ];

// const replies: any[] = []

const PAGE_SIZE = 10;

const RepliesContainer = ({ open, setOpen, commentId, comment }: RepliesContainerType) => {
    const { bottom } = useSafeArea();
    const params = useParams() as CommentParamsType
    const [commentInput, setCommentInput] = useState("");
    const [editCommentId, setEditCommentId] = useState<string | null>(null);
    const { inView, ref } = useInView({
        threshold: 0.1,
    });


    const fetchComments = async (pageParam: number): Promise<CommentType[]> => {
        if (!commentId) {
            throw new Error("Comment ID is required to fetch replies");
        }

        const { status, data } = await api.get(`/comments?id=${params.scanId}&chapterNumber=${params.chapterNumber}&page=${pageParam}&parentId=${commentId}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    }

    const {
        data: replies,
        isLoading,
        error,
        isFetching,
        fetchNextPage,
        hasNextPage,
        refetch,
    } = useInfiniteQuery<CommentType[], Error>({
        queryKey: ["replies", params.scanId, params.chapterNumber, commentId?.toString()],
        queryFn: ({ pageParam = 1 }: any) => fetchComments(pageParam),
        getNextPageParam: (lastPage, pages) =>
            lastPage.length == PAGE_SIZE ? pages?.length + 1 : undefined,
        initialPageParam: 1,
        staleTime: 1000000,
        enabled: Boolean(commentId),
    });

    useEffect(() => {
        if (inView && !isLoading && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, isLoading]);

    const handleEditComment = (commentId: string, content: string) => {
        setCommentInput(content);
        setEditCommentId(commentId);
    }

    if (!comment) return

    return (
        <Drawer open={open} onOpenChange={() => setOpen(false)}>
            <DrawerContent
                className="text-white h-4/5 bg-slate-800 border-0 outline-0"
                style={{ paddingBottom: `calc(${bottom}px + 5.2rem)` }}
            >
                <DrawerTitle hidden={true} />
                <DialogDescription className="sr-only">
                    Hidden description for screen readers.
                </DialogDescription>

                <div className="flex items-center justify-between px-2 pb-3 text-xl -mt-2">
                    <h1 className="">Replies {replies?.pages && replies?.pages.flat().length > 0 ? `(${replies.pages.flat().length})` : ""}</h1>
                    <div className="cursor-pointer" onClick={() => setOpen(false)}>
                        <IoMdClose />
                    </div>
                </div>

                <div className="flex flex-col overflow-y-auto h-full">
                    <Comment
                        id={comment.id}
                        user={comment.user}
                        date={comment.date}
                        content={comment.content}
                        repliesCount={comment.repliesCount || 0}
                        likesCount={comment.likesCount || 0}
                        dislikesCount={comment.dislikesCount || 0}
                        isLiked={comment.isLiked || false}
                        isDisliked={comment.isDisliked || false}
                        isReply={false}
                        onDelete={() => setOpen(false)}
                    />

                    {
                        isLoading && (
                            <div className="flex flex-col justify-center items-center py-4">
                                <Loading loadingText="Chargement des commentaires..." />
                            </div>
                        )
                    }

                    {
                        !isLoading && (error || !replies) && (
                            <div className="flex flex-col justify-center items-center text-white">
                                <h1 className="text-lg capitalize text-center">
                                    Une erreur s'est produite lors du chargement des commentaires.
                                </h1>
                                <button
                                    className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm"
                                    onClick={() => refetch()}
                                >
                                    Try Again
                                </button>
                            </div>
                        )
                    }

                    {
                        !isLoading && replies?.pages.flat().map((reply) => (
                            <Comment
                                key={reply.id}
                                id={reply.id}
                                user={reply.user}
                                date={reply.date}
                                content={reply.content}
                                repliesCount={reply.repliesCount || 0}
                                likesCount={reply.likesCount || 0}
                                dislikesCount={reply.dislikesCount || 0}
                                isLiked={reply.isLiked || false}
                                isDisliked={reply.isDisliked || false}
                                isReply={reply.isReply || Boolean(reply.parentId)}
                                parentId={reply.parentId}
                                handleEditComment={handleEditComment}
                            />
                        ))
                    }

                    {
                        !isLoading && !replies?.pages.flat().length && (
                            <div className="flex justify-center items-center py-4">
                                <p className="text-xs text-slate-300 text-center">Aucun commentaire pour le moment. Soyez le premier à commenter.</p>
                            </div>
                        )
                    }
                </div>

                <div
                    ref={ref}
                    className="w-full min-h-5"
                    style={{
                        paddingBottom: bottom,
                    }}
                >
                    {isFetching && !isLoading ? (
                        <div className="flex flex-col justify-center items-center w-full mt-3">
                            <Loading loadingText="Chargement..." />
                        </div>
                    ) : (
                        ""
                    )}
                </div>

                <CommentInput
                    comment={commentInput}
                    setComment={setCommentInput}
                    isEdit={Boolean(editCommentId)}
                    commentId={commentId}
                    editCommentId={editCommentId}
                    setEditCommentId={setEditCommentId}
                    placeholder="Répondre..."
                    onCommentUpdated={() => setEditCommentId(null)}
                />
            </DrawerContent>
        </Drawer>
    )
}

export default RepliesContainer