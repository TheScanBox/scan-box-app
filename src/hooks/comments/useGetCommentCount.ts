import api from "@/libs/api";
import { useQuery } from "@tanstack/react-query";

type UseGetCommentCountType = {
    commentCount: number;
    isLoading: boolean;
    refetch: () => void;
}

const useGetCommentCount = (scanId: string, chapterNumber: string): UseGetCommentCountType => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["commentCount", scanId, chapterNumber],
        queryFn: async () => {
            if (!scanId) throw new Error("Comment ID is required");

            const { data, status } = await api.get(`/comments/${scanId}/count?chapterNumber=${chapterNumber}`);

            if (status !== 200) {
                throw new Error("Network response was not ok");
            }

            return data;
        },
        enabled: scanId !== undefined && chapterNumber !== undefined,
        staleTime: 1000000,
    });

    return { commentCount: data?.count || 0, isLoading, refetch };
}

export default useGetCommentCount;