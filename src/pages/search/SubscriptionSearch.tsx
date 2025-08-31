import Loading from "@/components/Loading";
import SubscriptionItem from "@/components/SubscriptionItem";
import { useAlert } from "@/context/AlertContext";
import { useSafeArea } from "@/context/SafeAreaContext";
import useDebounce from "@/hooks/useDebounce";
import api from "@/libs/api";
import { Subscription } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SearchBar from "./components/SearchBar";
import { Page } from "@/components/Page";

type Props = {
    searchTerm?: string;
};

const UseSubscriptionSearch = ({ searchTerm = "" }: Props) => {

    const fetchSubscription = async () => {
        const res = await api.get(`/subscription/search?q=${searchTerm}`);

        if (res.status !== 200) {
            throw new Error('Network response was not ok');
        }

        return res.data as Subscription[];
    }

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["subscription_search", searchTerm],
        queryFn: fetchSubscription,
        enabled: searchTerm.length >= 3,
    });

    return { data, isLoading, isError, refetch };
}

const SubscriptionSearch = () => {
    const { bottom, top } = useSafeArea();
    const { showAlert } = useAlert();

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, isLoading, isError, refetch } = UseSubscriptionSearch({ searchTerm: debouncedSearch.toLowerCase() });

    return (
        <Page>
            <div
                className="text-white"
                style={{ marginTop: showAlert ? 0 : top, paddingBottom: bottom + 16 }}
            >
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <h2 className="text-xl font-bold px-3">Mes Abonnements</h2>

                {isLoading && (
                    <div className="mt-4">
                        <Loading
                            className="w-5 h-5 text-slate-400"
                            loadingText="Recherche en cours..." />
                    </div>
                )}

                {
                    !isLoading && isError && (
                        <div className="flex flex-col justify-center items-center rounded-lg mt-2 px-3">
                            <div className="text-xs sm:text-sm text-red-500">Une erreur est survenue lors de la recherche des abonnements. Veuillez réessayer.</div>
                            <button
                                className="bg-red-600 px-3 py-2 rounded-md mt-2 text-xs sm:text-sm mx-auto"
                                onClick={() => refetch()}
                            >
                                Réessayer
                            </button>
                        </div>
                    )
                }

                {
                    !isLoading && !isError && data && data.length === 0 && searchTerm.length >= 3 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Aucun abonnement trouvé pour "{searchTerm}".</div>
                    )
                }

                {
                    !isLoading && !isError && searchTerm.length > 0 && searchTerm.length < 3 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Veuillez entrer au moins 3 caractères pour lancer la recherche.</div>
                    )
                }

                {
                    !isLoading && !isError && searchTerm.length === 0 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Utilisez la barre de recherche pour recherche vos abonnements.</div>
                    )
                }

                {
                    !isLoading && !isError && data && data.length > 0 && (
                        <div className="mt-2 divide-y divide-slate-600">
                            {data.map((subscription) => (
                                <SubscriptionItem key={subscription.id} subscription={subscription} />
                            ))}
                        </div>
                    )
                }

            </div>
        </Page>
    )
}

export default SubscriptionSearch