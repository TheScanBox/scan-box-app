import api from "@/libs/api";
import { useQuery } from "@tanstack/react-query";

type FetchChaptersParams = {
    id: string;
    parentId?: string;
    enabled?: boolean;
}

const fetchChap = async (id: string, parentId?: string) => {
    const { data, status } = await api.get(
        `/chapters?key=${id}&parentId=${parentId || ""}`
    );

    if (status != 200) {
        throw new Error("Network response was not ok");
    }

    return data;
};

const useFetchChapters = ({ id, parentId, enabled = false }: FetchChaptersParams) => {
    return useQuery({
        queryKey: [[`chap_${id}`]],
        queryFn: async () => fetchChap(id, parentId),
        enabled: enabled,
        staleTime: Infinity
    });
}

export default useFetchChapters