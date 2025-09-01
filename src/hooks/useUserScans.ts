import api from "@/libs/api";
import { BookmarkScan, FavoriteScan, RecentScan, UserScansData } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export type ScanType = keyof UserScansData;

type UpdateScanPayload = {
    type: ScanType;
    data: UserScansData[ScanType][0];
};

const apiRoutes: Record<ScanType, string> = {
    favourites: "/favorite",
    bookmarks: "/bookmark",
    recents: "/readscan",
};

export const addScanItem = async (type: ScanType, item: any) => {
    const route = apiRoutes[type];
    const newItem = type === "recents" ? {
        userId: item.userId,
        scanId: item.scanId,
        chapterNumber: item.chapterNumber,
        chapterName: item.chapterName,
    } : {
        userId: item.userId,
        scanId: item.scanId,
    };
    const { data } = await api.post(route, newItem);

    return data;
}

const deleteScanItem = async (type: ScanType, id: string) => {
    const route = apiRoutes[type];
    const { data } = await api.delete(`${route}/${id}`);

    return data;
}

const updateScanItem = async (type: ScanType, item: any) => {
    const route = apiRoutes[type];
    const { data } = await api.put(`${route}/${item.scanId}`, item);

    return data;
}

export const useUserScans = (userId?: string) => {
    const queryClient = useQueryClient();

    const query = useQuery<UserScansData>({
        queryKey: ["userScans", userId],
        queryFn: async (): Promise<UserScansData> => {
            // const favResults = await cloudStorage.getItem("favourites") as unknown as Record<string, string>;
            const favoriteResponse = api.get<FavoriteScan[]>(`/favorite${userId ? `?userId=${userId}` : ""}`)
            const bookmarkResponse = api.get<BookmarkScan[]>(`/bookmark${userId ? `?userId=${userId}` : ""}`)
            const recentResponse = api.get<RecentScan[]>(`/readscan${userId ? `?userId=${userId}` : ""}`)

            const [favoriteResults, bookmarkResults, recentResults] = await Promise.all([
                favoriteResponse,
                bookmarkResponse,
                recentResponse
            ]);

            const favoriteData = favoriteResults.data;
            const bookmarkData = bookmarkResults.data;
            const recentData = recentResults.data;

            return {
                favourites: favoriteData || [],
                bookmarks: bookmarkData || [],
                recents: recentData || [],
            };
        },
        enabled: !!userId,
        staleTime: 600000, // 10 minutes
    });

    const addMutation = useMutation({
        mutationFn: async ({ type, data }: UpdateScanPayload) => addScanItem(type, data),
        onMutate: async ({ type, data }) => {
            const queryKey = ["userScans", userId];
            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<UserScansData>(queryKey);

            queryClient.setQueryData(queryKey, (oldData: any | undefined) => {
                if (!oldData) return oldData;

                const updatedScans = [data, ...oldData[type]];

                return {
                    ...oldData,
                    [type]: updatedScans
                };
            });

            return { previousData, queryKey };
        },
        onError: (_error, _newComment, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ type, data }: { type: ScanType, data: any }) => updateScanItem(type, data),
        onMutate: async ({ type, data }) => {
            const queryKey = ["userScans", userId];
            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<UserScansData>(queryKey);

            queryClient.setQueryData(queryKey, (oldData: any | undefined) => {
                if (!oldData) return oldData;

                const updatedScans = oldData[type].map((item: any) =>
                    item.scanId === data.scanId ? { ...item, ...data } : item
                );

                return {
                    ...oldData,
                    [type]: updatedScans
                };
            });

            return { previousData, queryKey };
        },
        onError: (_error, _newComment, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ type, scanId }: { type: ScanType, scanId: string }) => deleteScanItem(type, scanId),
        onMutate: async ({ type, scanId }) => {
            const queryKey = ["userScans", userId];
            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<UserScansData>(queryKey);

            queryClient.invalidateQueries({ queryKey: ["scans_search"] });

            queryClient.setQueryData(queryKey, (oldData: any | undefined) => {
                if (!oldData) return oldData;

                const updatedScans = oldData[type].filter((item: any) => item.scanId !== scanId);

                return {
                    ...oldData,
                    [type]: updatedScans
                };
            });

            return { previousData, queryKey };
        },
        onError: (_error, _newComment, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
        },
    });

    const getScanItem = useCallback(
        (type: ScanType, scanId: string): UserScansData[ScanType][0] | undefined => {
            const scans = query.data?.[type] || [];

            return scans.find((item: any) => item.scanId === scanId);
        },
        [query.data]
    );

    return {
        ...query,
        deleteScan: deleteMutation.mutateAsync,
        updateScan: updateMutation.mutateAsync,
        addScan: addMutation.mutateAsync,
        getScanItem
    };
}
