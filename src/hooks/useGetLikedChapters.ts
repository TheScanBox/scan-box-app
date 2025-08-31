import api from "@/libs/api";
import { useQuery } from "@tanstack/react-query"

export const useGetLikedChapters = <T>(scanId: string | undefined, { enabled }: { enabled: boolean }) => {
    return useQuery<T>({
        queryKey: ["likedChapters", scanId],
        queryFn: async () => {
            const { data, status } = await api.get(`/chapter-like/${scanId}/likes`);

            if (status !== 200) {
                throw new Error("Failed to fetch liked chapters");
            }

            return data;
        },
        staleTime: Infinity, // 5 minutes
        enabled: Boolean(scanId) && enabled,
    });

}