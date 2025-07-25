import api from "@/libs/api";
import { useQuery } from "@tanstack/react-query"

type UseGetChapterLikesCountType = {
    data: {
        likeCount: number;
        liked: boolean;
    };
    isLoading: boolean;
    refetch: () => void;
}

const useGetChapterLikesCount = (scanId: string, chapterNumber: string): UseGetChapterLikesCountType => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['chapterLikesCount', scanId, parseInt(chapterNumber)],
        queryFn: async () => {
            const { data, status } = await api.get(`/chapter-like/${scanId}/count?chapterNumber=${chapterNumber}`)

            if (status !== 200) {
                throw new Error("Network response was not ok");
            }

            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        data,
        isLoading,
        refetch,
    };
}

export default useGetChapterLikesCount