import api from "@/libs/api"
import { useEffect } from "react"

const useIncrementView = (scanId: string, { enabled }: { enabled: boolean }) => {
    useEffect(() => {
        if (!scanId) return
        if (!enabled) return

        const incrementView = async () => {
            try {
                await api.post(`/view/increment/${scanId}`)
            } catch (error) {
                console.error("Failed to increment view count:", error)
            }
        }

        incrementView()
    }, [scanId, enabled])
}

export default useIncrementView;