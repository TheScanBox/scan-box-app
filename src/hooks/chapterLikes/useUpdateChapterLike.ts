import api from "@/libs/api";
import { LikeChapterType } from "@/pages/ScanPreview";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ParamsType = {
    scanId: string;
    chapterNumber: number;
    userId: number
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
        onSuccess: (updatedLike) => {
            queryClient.setQueryData(
                ['chapterLikesCount', updatedLike.scanId, updatedLike.chapterNumber],
                (oldData: any | undefined) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        likeCount: updatedLike.likeCount,
                        liked: updatedLike.liked,
                    };
                }
            );

            queryClient.setQueryData(
                ["likedChapters", updatedLike.scanId],
                (oldData: LikeChapterType[] | undefined) => {
                    if (!oldData) return oldData;

                    if (updatedLike.liked) {
                        // Add chapterNumber if not already present
                        if (!oldData.some(chapter => chapter.chapterNumber === updatedLike.chapterNumber)) {
                            return [
                                ...oldData,
                                {
                                    chapterNumber: updatedLike.chapterNumber,
                                    likeCount: updatedLike.likeCount
                                }
                            ];
                        }
                        return oldData;
                    } else {
                        // Remove chapterNumber if present
                        return oldData.filter(
                            (chapter) => chapter.chapterNumber !== updatedLike.chapterNumber
                        );
                    }
                }
            );
        }
    });
}

export default useUpdateChapterLike