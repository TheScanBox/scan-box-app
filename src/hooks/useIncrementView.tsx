import api from "@/libs/api"
import { useEffect } from "react"

const useIncrementView = (scanId: string, { enabled }: { enabled: boolean }) => {
    useEffect(() => {
        if (!scanId) return
        if (!enabled) return

        const incrementView = async () => {
            if (sessionStorage.getItem(`viewed-${scanId}`) === "true") return;

            try {
                await api.post(`/view/increment/${scanId}`)
                sessionStorage.setItem(`viewed-${scanId}`, "true")
            } catch (error) {
                console.error("Failed to increment view count:", error)
            }
        }

        incrementView()
    }, [scanId, enabled])
}

export default useIncrementView;