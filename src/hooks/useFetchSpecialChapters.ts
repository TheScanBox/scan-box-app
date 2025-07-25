import api from '@/libs/api';
import { useQuery } from '@tanstack/react-query'

type FetchSpecialChaptersParams = {
    id: string;
    enabled?: boolean;
}

const fetchSpecialChap = async (id: string) => {
    const { data, status } = await api.get(`/specials/?key=${id}`);

    if (status != 200) {
        throw new Error("Network response was not ok");
    }

    return data;
};

const useFetchSpecialChapters = ({ id, enabled }: FetchSpecialChaptersParams) => {
    return useQuery<{ chap: number }[], Error>({
        queryKey: [`special_${id}`],
        queryFn: async () => await fetchSpecialChap(id),
        enabled: enabled,
    })
}

export default useFetchSpecialChapters