import useSubscription from "@/hooks/useSubscription";
import useUser from "@/hooks/useUser";
import { capitalize } from "@/pages/ScanPreview";
import { Subscription, SubscriptionStatus } from "@/types";
import { openPopup } from "@telegram-apps/sdk-react";
import { IoNotificationsOff, IoNotifications } from "react-icons/io5";
import { FaTrash } from "react-icons/fa"
import { useNavigate } from "react-router-dom";

type SubscriptionItemProps = {
    subscription: Subscription;
};

const SubscriptionItem = ({
    subscription
}: SubscriptionItemProps) => {
    const navigate = useNavigate();
    const user = useUser()
    const { deleteSubscription, updateSubscription } = useSubscription({ userId: user?.id.toString() })

    const handleOpen = () => {
        const path = subscription.scan?.scanParentId
            ? `/details/${subscription.scan?.scanId}/${subscription.scan?.scanParentId}`
            : `/details/${subscription.scan?.scanId}`;

        navigate(path);
    };

    const handleDelete = async (id: string) => {
        try {
            const buttonId = await openPopup({
                title: "Supprimer l’abonnement",
                message: "Êtes-vous sûr de vouloir supprimer cet abonnement ?",
                buttons: [
                    { text: "Supprimer", type: "destructive", id: "delete" },
                    { type: "cancel" }
                ]
            })

            if (buttonId !== "delete") return;
            await deleteSubscription(id)
            await openPopup({
                title: "Abonnement supprimé",
                message: "L’abonnement a été supprimé avec succès.",
                buttons: [{ type: "ok" }]
            })
        } catch (error) {
            console.error("Failed to delete subscription:", error);
            await openPopup({
                title: "Erreur",
                message: "Une erreur est survenue lors de la suppression de l’abonnement. Veuillez réessayer.",
                buttons: [{ type: "ok" }]
            })
        }
    }

    const handleUpdateStatus = async (id: string, status: SubscriptionStatus) => {
        try {
            await updateSubscription({
                subscriptionId: id,
                status,
            })

            if (status === "inactive") {
                await openPopup({
                    title: "Abonnement désactivé",
                    message: "Vous ne recevrez plus de notifications pour ce scan. Vous pouvez réactiver l'abonnement à tout moment.",
                    buttons: [{ type: "ok" }]
                })

                return;
            }

            await openPopup({
                title: "Abonnement activé",
                message: "Vous recevrez des notifications pour ce scan. Vous pouvez désactiver l'abonnement à tout moment.",
                buttons: [{ type: "ok" }]
            })
        } catch (error) {
            console.error("Failed to update subscription status:", error);

            await openPopup({
                title: "Erreur",
                message: "Une erreur est survenue lors de la mise à jour de l’abonnement. Veuillez réessayer.",
                buttons: [{ type: "ok" }]
            })
        }
    }

    return (
        <div
            onClick={handleOpen}
            className="flex items-start gap-4 px-3 py-2.5 cursor-pointer">
            <div>
                <img
                    src={subscription.scan?.imgUrl}
                    alt={subscription.scan?.title}
                    className="w-20 min-w-20 h-28 object-cover rounded"
                />
            </div>
            <div className="flex flex-col flex-1 gap-2">
                <div className="w-full flex items-center justify-between gap-2">
                    <h3 className="text-base font-medium w-[150px] sm:w-full truncate whitespace-nowrap">{capitalize(subscription.scan?.title!)}</h3>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded-full hover:bg-slate-700 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                const newStatus = subscription.status === "active" ? "inactive" : "active";
                                handleUpdateStatus(subscription.id, newStatus)
                            }}
                        >
                            {subscription.status === "active" ? (
                                <IoNotifications className="w-5 h-5 text-green-500" />
                            ) : (
                                <IoNotificationsOff className="w-5 h-5 text-red-500" />
                            )}
                        </button>

                        <button
                            className="p-2 rounded-full hover:bg-slate-700 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(subscription.id)
                            }}
                        >
                            <FaTrash className="w-5 h-5 text-slate-400" />
                        </button>

                    </div>
                </div>

                <div>
                    <p className="text-xs">
                        Derniere chapitre : <span className="text-slate-400">{subscription.scan?.latestChapter || "Inconnu"}</span>
                    </p>
                    <p className="text-xs">
                        Derniere sortie : <span className="text-slate-400">
                            {subscription.scan?.lastChapterAt && new Date(subscription.scan?.lastChapterAt).toLocaleDateString("fr-FR", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                            {!subscription.scan?.lastChapterAt && "Inconnu"}
                        </span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default SubscriptionItem;