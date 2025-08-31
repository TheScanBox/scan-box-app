import Loading from "@/components/Loading"
import SubscriptionItem from "@/components/SubscriptionItem"
import { useSafeArea } from "@/context/SafeAreaContext"
import useSubscription from "@/hooks/useSubscription"
import useUser from "@/hooks/useUser"

const Subscriptions = () => {
    const user = useUser()
    const { bottom } = useSafeArea()
    const { allSubscriptions, isLoadingAllSubscriptions, deleteSubscription, updateSubscription } = useSubscription({ userId: user?.id.toString() })

    if (isLoadingAllSubscriptions) {
        return (
            <div className="flex flex-col justify-center items-center mt-2">
                <Loading
                    loadingText="Chargement..."
                    className="w-5 h-5"
                />
            </div>
        )
    }

    return (
        <div
            className="flex flex-col items-center w-full"
            style={{ paddingBottom: bottom + 16 }}
        >
            {
                allSubscriptions && allSubscriptions.length > 0 ? (
                    <div className="w-full max-w-2xl divide-y divide-slate-600">
                        {allSubscriptions
                            .slice() // create a copy to avoid mutating original
                            .sort((a, b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0))
                            .map((subscription) => (
                                <SubscriptionItem
                                    key={subscription.id}
                                    subscription={subscription}
                                />
                            ))}
                    </div>
                ) : (
                    <p className="text-xs text-center text-slate-400 px-3">Vous n’avez encore aucun abonnement. Abonnez-vous à un scan pour qu’il apparaisse ici.</p>
                )
            }
        </div>

    )
}

export default Subscriptions