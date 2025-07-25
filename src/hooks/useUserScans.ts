import { Fav, Recent } from "@/pages/Profile";
import { UserScansData } from "@/pages/tabs/Scans";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cloudStorage } from "@telegram-apps/sdk-react";

export type ScanType = keyof UserScansData;

type UpdateScanPayload = {
    type: ScanType;
    data: Partial<Fav | Recent> & { delete?: boolean };
};

export const useUserScans = () => {
    const queryClient = useQueryClient();

    const query = useQuery<UserScansData>({
        queryKey: ["userScans"],
        queryFn: async (): Promise<UserScansData> => {
            const favResults = await cloudStorage.getItem("favourites") as unknown as Record<string, string>;
            const bookmarkResults = await cloudStorage.getItem("bookmarks") as unknown as Record<string, string>;;
            const recentResults = await cloudStorage.getItem("recents") as unknown as Record<string, string>;;

            return {
                favourites: favResults?.favourites ? JSON.parse(favResults.favourites) : [],
                bookmarks: bookmarkResults?.bookmarks ? JSON.parse(bookmarkResults.bookmarks) : [],
                recents: recentResults?.recents ? JSON.parse(recentResults.recents) : [],
            };
        },
        staleTime: 600000, // 10 minutes
    });

    const mutation = useMutation({
        mutationFn: async ({ type, data }: UpdateScanPayload) => {
            const oldData = queryClient.getQueryData<UserScansData>(["userScans"])?.[type] || [];
            const isNewData = oldData.findIndex(item => item.scanId === data.scanId) === -1;

            const filteredData = oldData.filter(item => item.scanId !== data.scanId);
            const updatedData = !isNewData && type == "recents" && !data.delete ? [data, ...filteredData] : !isNewData ? filteredData : [data, ...oldData];

            await cloudStorage.setItem(type, JSON.stringify(updatedData));

            return { type, data: updatedData };
        },
        onSuccess: ({ type, data }) => {
            queryClient.setQueryData(["userScans"], (prev: any) => ({
                ...prev,
                [type]: data,
            }));
        },
    });

    const getScanItem = (type: ScanType, scanId: string) => {
        const scans = query.data?.[type] || [];

        return scans.find((item: any) => item.scanId === scanId);
    };

    return { ...query, updateState: mutation.mutateAsync, getScanItem };
}
