import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/libs/api";
import { CommentType } from "@/types";

const updateCommentOnServer = async ({
    commentId,
    content,
    userId
}: { commentId: string; content: string, userId: string }) => {
    const { data, status } = await api.put(`/comments/${commentId}`, { content, userId });
    if (status !== 200) {
        throw new Error("Network response was not ok");
    }
    return data; // Should return the updated comment
};

export const useUpdateComment = (scanId: string, chapterNumber: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { commentId: string; content: string, userId: string, fromProfile: boolean }) =>
            updateCommentOnServer(params),
        onSuccess: (updatedComment: CommentType, variable) => {
            queryClient.setQueryData(
                variable.fromProfile
                    ? [`comments_user_${variable.userId}`]
                    : updatedComment.parentId
                        ? ["replies", scanId, chapterNumber, updatedComment.parentId.toString()]
                        : ["comments", scanId, chapterNumber],
                (oldData: any | undefined) => {
                    if (!oldData) return oldData;

                    if (variable.fromProfile) {
                        queryClient.invalidateQueries({ queryKey: ["comment", updatedComment.parentId ? updatedComment.parentId : updatedComment.id] });
                    }

                    const PAGE_SIZE = 10;
                    // Flatten all comments
                    const allComments: CommentType[] = oldData.pages.flat();
                    // Update the edited comment
                    const newComments = allComments.map((comment) =>
                        comment.id === updatedComment.id
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
    });
};