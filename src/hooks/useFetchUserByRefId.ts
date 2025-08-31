import api from "@/libs/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type User = {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    createdAt: string;
    success: boolean;
    bio?: string;
}

export const useFetchUserByRefId = (userId: string) => {
    const fetchUser = async () => {
        const { data, status } = await api.get<User>(`/users?id=${userId}`);

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const { data: user, isLoading: loading, isError: error } = useQuery({
        queryKey: ['fetchUser', userId],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });


    return { user, loading, error };
}