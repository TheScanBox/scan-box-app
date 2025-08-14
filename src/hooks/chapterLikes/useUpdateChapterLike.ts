import api from "@/libs/api";
import { LikeChapterType } from "@/pages/ScanPreview";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ParamsType = {
    scanId: string;
    chapterNumber: number;
    userId: number
    liked: boolean;
};

const updateChapterLike = async ({ chapterNumber, scanId, userId }: ParamsType) => {
    const { data, status } = await api.post(`/chapter-like/${scanId}/update`, {
        chapterNumber: chapterNumber,
        userId: userId
    });

    if (status !== 200) {
        throw new Error("Network response was not ok");
    }

    return data;
};

const useUpdateChapterLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: ParamsType) => updateChapterLike(params),
        onMutate: async (params) => {
            await queryClient.cancelQueries({
                queryKey: ['chapterLikesCount', params.scanId, params.chapterNumber]
            });

            await queryClient.cancelQueries({
                queryKey: ['likedChapters', params.scanId]
            });

            const prevLikesCount = queryClient.getQueryData<any>([
                'chapterLikesCount',
                params.scanId,
                params.chapterNumber
            ]);

            const prevLikedChapters = queryClient.getQueryData<LikeChapterType[]>([
                'likedChapters',
                params.scanId
            ]);

            // Update "chapterLikesCount" optimistically
            queryClient.setQueryData(
                ['chapterLikesCount', params.scanId, params.chapterNumber],
                (oldData: any | undefined) => {
                    if (!oldData) return oldData;
                    const newLikeCount = params.liked
                        ? oldData.likeCount + 1
                        : oldData.likeCount - 1;

                    return {
                        ...oldData,
                        likeCount: newLikeCount,
                        liked: params.liked
                    };
                }
            );

            // Update "likedChapters" optimistically
            queryClient.setQueryData(
                ['likedChapters', params.scanId],
                (oldData: LikeChapterType[] | undefined) => {
                    if (!oldData) return oldData;

                    if (params.liked) {
                        if (!oldData.some(c => c.chapterNumber === params.chapterNumber)) {
                            return [
                                ...oldData,
                                {
                                    chapterNumber: params.chapterNumber,
                                    likeCount: (prevLikesCount?.likeCount ?? 0) + 1
                                }
                            ];
                        }
                        return oldData;
                    } else {
                        return oldData.filter(c => c.chapterNumber !== params.chapterNumber);
                    }
                }
            );

            // Return rollback snapshot
            return { prevLikesCount, prevLikedChapters };
        },
        onError: (_err, params, context) => {
            if (context?.prevLikesCount) {
                queryClient.setQueryData(
                    ['chapterLikesCount', params.scanId, params.chapterNumber],
                    context.prevLikesCount
                );
            }
            if (context?.prevLikedChapters) {
                queryClient.setQueryData(
                    ['likedChapters', params.scanId],
                    context.prevLikedChapters
                );
            }
        },
    });
}

export default useUpdateChapterLike