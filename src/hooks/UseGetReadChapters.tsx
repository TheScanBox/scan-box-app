import api from '@/libs/api'
import { useQuery } from '@tanstack/react-query'

type ReadChapter = {
    id: number;
    chapterNumber: number;
    lastReadAt: string;
}

const UseGetReadChapters = (scanId: string, userId: string, { enabled }: { enabled: boolean }) => {
    return useQuery({
        queryKey: ['readChapters', scanId],
        queryFn: async () => {
            const res = await api.get<ReadChapter[]>(`/read-chapter/user/${userId}/scan/${scanId}`)
            return res.data
        },
        staleTime: Infinity,
        enabled: Boolean(scanId) && Boolean(userId) && enabled,
    })
}

export default UseGetReadChapters