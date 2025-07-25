import api from "@/libs/api";

import { useMutation, useQueryClient } from "@tanstack/react-query";

const postCommentToServer = async (comment: any) => {
    const { data } = await api.post("/comments", comment)

    return data
};

export const useAddComment = (scanId: string, chapterNumber: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newComment: any) => postCommentToServer(newComment),
        onSuccess: (newComment, variable) => {
            queryClient.setQueryData(
                variable.fromProfile ? [`comments_user_${newComment.userId}`] :
                    newComment.parentId ? ['replies', scanId, chapterNumber, newComment.parentId.toString()] : ['comments', scanId, chapterNumber],
                (oldData: any | undefined) => {
                    if (!oldData) return oldData;

                    if (variable.fromProfile) {
                        queryClient.invalidateQueries({ queryKey: ["comment", newComment.parentId ? newComment.parentId : newComment.id] });
                    }

                    // If your data structure is { pages: [[comments]] }
                    // Flatten all comments, add new one at the top, then re-chunk
                    const allComments = oldData.pages.flat();
                    const updatedComments = [newComment, ...allComments];

                    // Re-chunk comments into pages of PAGE_SIZE
                    const PAGE_SIZE = 10;
                    const chunkedPages = [];
                    for (let i = 0; i < updatedComments.length; i += PAGE_SIZE) {
                        chunkedPages.push(updatedComments.slice(i, i + PAGE_SIZE));
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
