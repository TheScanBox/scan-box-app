import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/libs/api";
import { CommentType } from "@/types";

const likeCommentOnServer = async (commentId: string) => {
    const { data, status } = await api.post(`/comments/${commentId}/like`);

    if (status !== 200) {
        throw new Error("Network response was not ok");
    }

    return data;
};

export const useLikeComment = (scanId: string, chapterNumber: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { commentId: string, fromProfile: boolean }) => likeCommentOnServer(params.commentId),
        onSuccess: (updatedComment: CommentType, variable) => {
            queryClient.setQueryData(
                updatedComment.parentId ? ['replies', scanId, chapterNumber, updatedComment.parentId.toString()] : ['comments', scanId, chapterNumber],
                (oldData: any | undefined) => {
                    if (variable.fromProfile && !updatedComment.parentId) {
                        queryClient.setQueryData(
                            ['comment', updatedComment.id],
                            (oldComment: CommentType | undefined) => {
                                if (!oldComment) return oldComment;

                                // Update the likes count in the parent comment
                                return {
                                    ...oldComment,
                                    likesCount: updatedComment.likesCount,
                                    isLiked: updatedComment.isLiked,
                                    isDisliked: updatedComment.isDisliked,
                                    dislikesCount: updatedComment.dislikesCount
                                };
                            }
                        );
                    }

                    if (variable.fromProfile && updatedComment.parentId) {
                        // queryClient.invalidateQueries({ queryKey: ["comment", updatedComment.parentId] });
                        // return oldData;

                        queryClient.setQueryData(
                            ['comment', updatedComment.parentId],
                            (oldComment: CommentType | undefined) => {
                                if (!oldComment) return oldComment;

                                // Update the replies count in the parent comment
                                const updatedReplies = oldComment.replies?.map(reply =>
                                    reply.id === updatedComment.id ? { ...reply, ...updatedComment } : reply
                                );

                                return {
                                    ...oldComment,
                                    replies: updatedReplies
                                };
                            }
                        );

                        return oldData;
                    }

                    if (!oldData) return oldData;
                    if (!updatedComment) return oldData;

                    const PAGE_SIZE = 10;
                    // Flatten all comments
                    const allComments: CommentType[] = oldData.pages.flat();
                    // Update the liked comment
                    const newComments = allComments.map((comment) =>
                        comment.id == updatedComment.id
                            ? { ...comment, ...updatedComment }
                            : comment
                    );

                    // Re-chunk into pages
                    const chunkedPages = [];
                    for (let i = 0; i < newComments.length; i += PAGE_SIZE) {
                        chunkedPages.push(newComments.slice(i, i + PAGE_SIZE));
                    }

                    return {
                        ...oldData,
                        pages: chunkedPages,
                    };
                }
            );
        },
        onError: (error) => {
            const status = (error as any)?.response?.status;

            if (status === 404) {
                alert("Comment not found");
                return;
            }

            if (status === 400) {
                alert((error as any)?.response?.data?.message || "Cannot like your own comment");
                return;
            }

            console.error("Error liking comment:", error);
            alert("Failed to like comment. Please try again.");
        }
    });
};