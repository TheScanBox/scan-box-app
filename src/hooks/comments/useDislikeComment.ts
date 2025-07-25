import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/libs/api";
import { CommentType } from "@/pages/Comments";

const likeCommentOnServer = async (commentId: string) => {
    const { data, status } = await api.post(`/comments/${commentId}/dislike`);

    if (status !== 200) {
        throw new Error("Network response was not ok");
    }

    return data;
};

export const useDislikeComment = (scanId: string, chapterNumber: string) => {
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

                                // Update the dislikes count in the parent comment
                                return {
                                    ...oldComment,
                                    dislikesCount: updatedComment.dislikesCount,
                                    isDisliked: updatedComment.isDisliked,
                                    isLiked: updatedComment.isLiked,
                                    likesCount: updatedComment.likesCount
                                };
                            }
                        );
                    }

                    if (variable.fromProfile && updatedComment.parentId) {
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
                alert((error as any)?.response?.data?.message || "Cannot dislike your own comment");
                return;
            }

            alert("Failed to dislike comment. Please try again.");
        }
    });
};