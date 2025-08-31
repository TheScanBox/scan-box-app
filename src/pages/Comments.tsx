import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Page } from "../components/Page";
import Comment from "../components/Comment";
import CommentInput from "../components/CommentInput";
import { useAlert } from "../context/AlertContext";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useEffect, useState } from "react";
import RepliesContainer from "@/components/RepliesContainer";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import api from "@/libs/api";
import { useInView } from "react-intersection-observer";
import CommentLoading from "@/components/CommentLoading";
import { IoMdShareAlt } from "react-icons/io";
import { shareURL } from "@telegram-apps/sdk-react";
import { capitalize } from "./ScanPreview";
import { FaBookOpenReader } from "react-icons/fa6";
import { CommentType } from "@/types";

export type CommentParamsType = {
    scanId: string,
    chapterNumber: string
}

type CategoryType = "Top" | "Newest";

const PAGE_SIZE = 10;
const sortComments = (comments: CommentType[], category: CategoryType): CommentType[] => {
    if (category === "Top") {
        return comments.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else {
        return comments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
}

type HeaderType = {
    setCategory: React.Dispatch<React.SetStateAction<CategoryType>>;
    category: CategoryType;
    numComment: number;
    title: string;
    chapterNumber: string | number;
    handleCopy?: () => void;
    handleRead?: () => void;
    showReadButton?: boolean;
}

const Header = ({ setCategory, category, numComment, title, chapterNumber, showReadButton = false, handleCopy, handleRead }: HeaderType) => (
    <div>
        <div className="flex items-center justify-between px-3 py-2  border-slate-700">
            <h1 className="flex flex-col text-xl text-white">
                Commentaires {numComment > 0 ? `(${numComment})` : ""}
                <span className="text-xs text-slate-500 capitalize truncate">{title} #{chapterNumber}</span>
            </h1>

            <div className="flex items-center gap-3">
                {showReadButton && <button title="Lire" className="cursor-pointer text-white" onClick={() => handleRead?.()}>
                    <FaBookOpenReader size={24} />
                </button>}
                <button title="Partager" className="cursor-pointer text-white" onClick={() => handleCopy?.()}>
                    <IoMdShareAlt size={24} />
                </button>
            </div>
        </div>
        <div className={`text-white flex items-center justify-between border-slate-700 border-t ${numComment == 0 && "border-b"}`}>
            <button onClick={() => setCategory("Top")} className={`w-full cursor-pointer py-2 ${category == "Top" && "border-b"}`}>Populaires</button>
            <button onClick={() => setCategory("Newest")} className={`w-full cursor-pointer py-2 ${category == "Newest" && "border-b"}`}>Recent</button>
        </div>
    </div>

)

const Comments = () => {
    const params = useParams() as CommentParamsType;
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { top, bottom } = useSafeArea()
    const { inView, ref } = useInView({
        threshold: 0.1,
    });
    const { state, search } = useLocation();

    const queryClient = useQueryClient();

    const [comment, setComment] = useState("");
    const [category, setCategory] = useState<CategoryType>("Top");
    const [open, setOpen] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [editCommentId, setEditCommentId] = useState<string | null>(null);

    const handleOpenReplies = (commentId: string) => {
        setOpen(true);
        setSelectedCommentId(commentId);
    };

    const fetchComments = async (pageParam: number): Promise<CommentType[]> => {
        const { status, data } = await api.get(`/comments?id=${params.scanId}&chapterNumber=${params.chapterNumber}&page=${pageParam}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    }

    const {
        data: comments,
        isLoading,
        error,
        isFetching,
        fetchNextPage,
        hasNextPage,
        refetch,
    } = useInfiniteQuery<CommentType[], Error>({
        queryKey: ["comments", params.scanId, params.chapterNumber],
        queryFn: ({ pageParam = 1 }: any) => fetchComments(pageParam),
        getNextPageParam: (lastPage, pages) =>
            lastPage.length == PAGE_SIZE ? pages?.length + 1 : undefined,
        initialPageParam: 1,
        staleTime: 1000000,
    });

    useEffect(() => {
        if (inView && !isLoading && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, isLoading]);

    const handleEditComment = (commentId: string, content: string) => {
        setComment(content);
        setEditCommentId(commentId.toString());
    }

    const handleCopy = () => {
        const APP_URL = import.meta.env.VITE_APP_URL;
        shareURL(`${APP_URL}?startapp=comment_${params.scanId}_${params.chapterNumber}`, `Lisez les commentaires du Chapitre ${params.chapterNumber} de **${capitalize(state.scan?.title || state.currentState?.data.title || "Unknown")}** !\n\n`);
    };

    const handleRead = () => {
        const path = state.scan?.scanParentId ? `/read/${params.scanId}/${params.chapterNumber}/${state.scan.scanParentId}` : `/read/${params.scanId}/${params.chapterNumber}`;
        navigate(path, {
            state: {
                data: {
                    ...state.scan,
                },
            },
            replace: true,
        });
    };

    const onCommentAdded = () => {
        setCategory("Newest");

        queryClient.invalidateQueries({
            queryKey: ['commentCount', params.scanId, params.chapterNumber]
        });
    }

    const onCommentDeleted = () => {
        queryClient.invalidateQueries({
            queryKey: ['commentCount', params.scanId, params.chapterNumber]
        });
        console.log("Comment deleted, invalidating chapter likes count");
    }

    if (isLoading) {
        return (
            <Page>
                <div
                    className="flex flex-col md:max-w-[700px] mx-auto"
                    style={{
                        marginTop: showAlert ? 0 : top,
                        paddingBottom: `calc(${bottom}px + 4rem)`,
                    }}
                >
                    <Header
                        setCategory={setCategory}
                        category={category}
                        numComment={0}
                        title={state.scan?.title || state.currentState?.data.title || "Unknown"}
                        chapterNumber={params.chapterNumber || "Unknown"}
                        handleCopy={handleCopy}
                        handleRead={handleRead}
                        showReadButton={search.includes("source=profile") || search.includes("source=auth")}
                    />

                    <div className="flex flex-col w-full h-full items-center gap-2">
                        <CommentLoading />
                        <CommentLoading />
                        <CommentLoading />
                        <CommentLoading />
                    </div>
                </div>
            </Page>
        );
    }

    if (!isLoading && (error || !comments)) {
        return (
            <Page>
                <div className="h-screen flex flex-col justify-center items-center text-white">
                    <h1 className="text-xl capitalize text-center">
                        Une erreur s'est produite lors du chargement des commentaires.
                    </h1>
                    <button
                        className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm"
                        onClick={() => refetch()}
                    >
                        Try Again
                    </button>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <div
                className="flex flex-col md:max-w-[700px] mx-auto"
                style={{
                    marginTop: showAlert ? 0 : top,
                    paddingBottom: `calc(${bottom}px + 4rem)`,
                }}
            >
                <Header
                    setCategory={setCategory}
                    category={category}
                    numComment={comments?.pages?.flat()?.length || 0}
                    title={state.scan?.title || state.currentState?.data.title || "Unknown"}
                    chapterNumber={params.chapterNumber || "Unknown"}
                    handleCopy={handleCopy}
                    handleRead={handleRead}
                    showReadButton={search.includes("source=profile") || search.includes("source=auth")}
                />

                {

                    sortComments(comments?.pages.flat() || [], category).map((comment) => (
                        <Comment
                            key={comment.id}
                            id={comment.id}
                            user={comment.user}
                            date={comment.date}
                            content={comment.content}
                            repliesCount={comment.repliesCount || 0}
                            likesCount={comment.likesCount || 0}
                            dislikesCount={comment.dislikesCount || 0}
                            isLiked={comment.isLiked || false}
                            isDisliked={comment.isDisliked || false}
                            handleOpenReplies={handleOpenReplies}
                            handleEditComment={handleEditComment}
                            onDelete={onCommentDeleted}
                        />
                    ))
                }

                {!comments?.pages.flat().length &&
                    <div className="h-full flex justify-center items-center py-4">
                        <p className="text-xs text-slate-300 text-center">Aucun commentaire pour le moment. Soyez le premier à commenter.</p>
                    </div>
                }

                <div
                    ref={ref}
                    className="w-full min-h-5"
                    style={{
                        paddingBottom: bottom,
                    }}
                >
                    {isFetching ? (
                        <div className="flex flex-col justify-center items-center w-full mt-3">
                            <Loading loadingText="Chargement..." />
                        </div>
                    ) : (
                        ""
                    )}
                </div>

                <CommentInput
                    comment={comment}
                    setComment={setComment}
                    isEdit={Boolean(editCommentId)}
                    editCommentId={editCommentId}
                    setEditCommentId={setEditCommentId}
                    onCommentAdded={onCommentAdded}
                    onCommentUpdated={() => setEditCommentId(null)}
                    placeholder="Laisser un commentaire..."
                />
                <RepliesContainer
                    open={open}
                    setOpen={setOpen}
                    commentId={selectedCommentId!}
                    comment={comments?.pages.flat().find(c => c?.id?.toString() === selectedCommentId)}
                />
            </div>
        </Page>
    );
};
export default Comments;
