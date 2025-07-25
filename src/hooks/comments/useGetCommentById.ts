import api from "@/libs/api"
import { useQuery } from "@tanstack/react-query"

const getCommentById = async (commentId?: string | null) => {
    if (!commentId) throw new Error("Comment ID is required");

    const { data, status } = await api.get(`/comments/${commentId}`)
    if (status !== 200) {
        throw new Error("Network response was not ok");
    }

    return data;
}

export const useGetCommentById = <T>(commentId?: string | null) => {
    return useQuery<T>({
        queryKey: ["comment", commentId],
        queryFn: () => getCommentById(commentId),
        staleTime: 1000000,
        enabled: Boolean(commentId),
    })
}
