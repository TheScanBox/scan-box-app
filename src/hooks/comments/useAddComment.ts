import api from "@/libs/api";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import useUser from "../useUser";

const postCommentToServer = async (comment: any) => {
    const { data } = await api.post("/comments", comment)

    return data
};

export const useAddComment = (scanId: string, chapterNumber: string) => {
    const queryClient = useQueryClient();
    const user = useUser();

    return useMutation({
        mutationFn: (newComment: any) => postCommentToServer(newComment),
        onMutate: async (newComment: any) => {
            const queryKey = newComment.fromProfile
                ? [`comments_user_${newComment.userId}`]
                : newComment.parentId
                    ? ['replies', scanId, chapterNumber, newComment.parentId.toString()]
                    : ['comments', scanId, chapterNumber];

            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<any>(queryKey);

            queryClient.setQueryData(queryKey, (oldData: any | undefined) => {
                if (!oldData) return oldData;

                if (newComment.fromProfile) {
                    queryClient.invalidateQueries({
                        queryKey: ["comment", newComment.parentId ? newComment.parentId : newComment.id]
                    });
                }

                // Flatten pages, add the new comment at the top
                const allComments = oldData.pages.flat();
                const updatedComments = [{
                    ...newComment,
                    id: newComment.id || crypto.randomUUID(), // Ensure we have an ID
                    date: new Date().toISOString(), // Set current date,
                    likesCount: 0,
                    dislikesCount: 0,
                    isLiked: false,
                    isDisliked: false,
                    repliesCount: 0,
                    user: {
                        id: user?.id || 0,
                        name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
                        avatar: user?.photo_url || ""
                    },
                    replies: [],

                }, ...allComments];

                // Re-chunk into PAGE_SIZE pages
                const PAGE_SIZE = 10;
                const chunkedPages = [];
                for (let i = 0; i < updatedComments.length; i += PAGE_SIZE) {
                    chunkedPages.push(updatedComments.slice(i, i + PAGE_SIZE));
                }

                return {
                    ...oldData,
                    pages: chunkedPages,
                };
            });

            return { queryKey, previousData };
        },
        onError: (_error, _newComment, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
        },
    });
};
