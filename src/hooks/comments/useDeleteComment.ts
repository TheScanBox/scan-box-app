// hooks/useDeleteComment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/libs/api';
import { CommentType } from '@/pages/Comments';
import useUser from '../useUser';
import { openPopup } from '@telegram-apps/sdk-react';

const deleteCommentFromServer = async (commentId: string) => {
    const { status, data } = await api.delete(`/comments/${commentId}`)

    if (status !== 200) {
        throw new Error("Network response was not ok");
    }

    return data.comment
}

export const useDeleteComment = (scanId: string, chapterNumber: string) => {
    const queryClient = useQueryClient();
    const user = useUser();

    return useMutation({
        mutationFn: (params: { commentId: string, fromProfile: boolean }) => deleteCommentFromServer(params.commentId),
        onSuccess: (deletedComment: CommentType, variable) => {
            queryClient.setQueryData(
                variable.fromProfile ? [`comments_user_${user?.id}`] :
                    deletedComment.parentId ? ['replies', scanId, chapterNumber, deletedComment.parentId.toString()] : ['comments', scanId, chapterNumber],
                (oldData: any | undefined) => {
                    if (!oldData) return oldData;
                    console.log(variable.fromProfile, user?.id);

                    if (variable.fromProfile && deletedComment.parentId) {
                        queryClient.invalidateQueries({ queryKey: ["comment", deletedComment.parentId] });
                    }

                    // If the comment is a reply, we need to update the replies list
                    const PAGE_SIZE = 10;

                    // Flatten all comments
                    const allComments: CommentType[] = oldData.pages.flat();

                    // Filter out deleted comment
                    const updatedComments = allComments.filter(
                        (comment) => comment.id !== deletedComment.id
                    );

                    // Re-chunk into pages
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
        onError: () => {
            openPopup({
                message: "Une erreur s'est produite lors de la suppression du commentaire. Veuillez réessayer plus tard.",
            });
        },
    });
};
