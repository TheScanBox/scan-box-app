import api from "@/libs/api";
import { useInfiniteQuery } from "@tanstack/react-query";

const getCommentsByUserId = async (page: number, userId?: number) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const { data, status } = await api.get(`/comments/user/${userId}?page=${page}`);

    if (status !== 200) {
        throw new Error("Failed to fetch comments");
    }

    return data;
};

const PAGE_SIZE = 10;

export const useGetCommentsByUserId = <T extends any[]>(userId?: number) => {
    return useInfiniteQuery<T>({
        queryKey: [`comments_user_${userId}`],
        queryFn: ({ pageParam = 1 }: any) => getCommentsByUserId(pageParam, userId),
        getNextPageParam: (lastPage, pages) => lastPage.length === PAGE_SIZE ? pages.length + 1 : undefined,
        initialPageParam: 1,
        staleTime: 0,
        enabled: Boolean(userId),
        refetchOnMount: true
    });
}

