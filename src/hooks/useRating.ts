import { useState, useEffect } from "react";
import api from "../libs/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { openPopup } from "@telegram-apps/sdk-react";

const useRating = (userId: string, scanId: string, { enabled }: { enabled: boolean }) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["rating", userId, scanId],
        queryFn: async () => {
            const { data, status } = await api.get(`/rating?userId=${userId}&scanId=${scanId}`);

            if (status !== 200) {
                throw new Error("Failed to fetch rating");
            }

            return data.rating.value;
        },
        enabled: !!userId && !!scanId && enabled,
        staleTime: Infinity
    });

    const mutation = useMutation({
        mutationFn: async (newRating: string) => {
            const { data, status } = await api.post(`/rating`, {
                userId,
                scanId,
                value: newRating
            });

            if (status !== 200) {
                throw new Error("Failed to update rating");
            }

            return data.rating.value;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(
                ["rating", userId, scanId],
                (oldData: any) => {
                    if (!oldData) return oldData

                    return data;
                }
            )

        },
        onError: () => {
            openPopup({
                message: "Failed to update rating. Please try again later.",
            });
        }
    })

    return {
        loading: query.isLoading,
        error: query.isError,
        rating: query.data as number,
        setRating: mutation.mutateAsync
    };
};

export default useRating;
