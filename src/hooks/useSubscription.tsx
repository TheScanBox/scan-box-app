import api from "@/libs/api";
import { Subscription } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseSubscriptionProps = {
    userId?: string;
    scanId?: string;
}

const createSubscriptionFunc = async (scanId: string, userId: string) => {
    const res = await api.post(`/subscription`, { scanId, userId });

    if (res.status !== 201) {
        throw new Error('Network response was not ok');
    }

    return res.data as Subscription;
}

const deleteSubscriptionFunc = async (subscriptionId: string) => {
    const res = await api.delete(`/subscription/${subscriptionId}`);

    if (res.status !== 204) {
        throw new Error('Network response was not ok');
    }

    return res.data as { message: string };
}

export const updateSubscriptionFunc = async (subscriptionId: string, status: string) => {
    const res = await api.put(`/subscription/${subscriptionId}`, { status });

    if (res.status !== 200) {
        throw new Error('Network response was not ok');
    }

    return res.data as Subscription;
}

const useSubscription = ({ userId, scanId }: UseSubscriptionProps) => {
    const queryClient = useQueryClient();

    const fetchSubscriptionByScanId = async () => {
        const res = await api.get(`/subscription/${scanId}`);

        if (res.status !== 200) {
            throw new Error('Network response was not ok');
        }

        return res.data as Subscription | null;
    }

    const fetchAllSubscriptionsByUserId = async () => {
        const res = await api.get(`/subscription`);

        if (res.status !== 200) {
            throw new Error('Network response was not ok');
        }

        return res.data as Subscription[];
    }

    const subscriptionQuery = useQuery({
        queryKey: ['subscription', scanId],
        queryFn: fetchSubscriptionByScanId,
        enabled: !!scanId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const allSubscriptionsQuery = useQuery({
        queryKey: ['allSubscriptions'],
        queryFn: fetchAllSubscriptionsByUserId,
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const createSubscription = useMutation({
        mutationFn: ({ scanId, userId }: { scanId: string; userId: string }) => createSubscriptionFunc(scanId, userId),
        onSuccess: (newSubscription) => {
            queryClient.invalidateQueries({ queryKey: ['allSubscriptions'] });
            queryClient.setQueryData(['subscription', scanId], newSubscription);
        },
    });

    const deleteSubscription = useMutation({
        mutationFn: (subscriptionId: string) => deleteSubscriptionFunc(subscriptionId),
        onMutate: async (subscriptionId) => {
            await queryClient.cancelQueries({ queryKey: ['allSubscriptions'] });
            await queryClient.cancelQueries({ queryKey: ['subscription', scanId] });

            const previousSubscriptions = queryClient.getQueryData<Subscription[]>(['allSubscriptions']);
            const previousSubscription = queryClient.getQueryData<Subscription>(['subscription', scanId]);

            queryClient.invalidateQueries({ queryKey: ['subscription_search'] });

            queryClient.setQueryData(['subscription', scanId], null);
            queryClient.setQueryData(['allSubscriptions'], (old: Subscription[]) => {
                if (!old) return old;

                return old.filter(sub => sub.id !== subscriptionId);
            });

            return { previousSubscription, previousSubscriptions };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousSubscription) {
                queryClient.setQueryData(['subscription', scanId], context.previousSubscription);
                queryClient.setQueryData(['allSubscriptions'], context.previousSubscriptions);
            }
        }
    });

    const updateSubscription = useMutation({
        mutationFn: ({ subscriptionId, status }: { subscriptionId: string; status: string }) => updateSubscriptionFunc(subscriptionId, status),
        onMutate: async (variables) => {
            const queryKey = ['allSubscriptions'];

            await queryClient.cancelQueries({ queryKey });
            const previousSubscriptions = queryClient.getQueryData<Subscription>(queryKey);

            queryClient.invalidateQueries({ queryKey: ['subscription_search'] });

            queryClient.setQueryData(queryKey, (old: Subscription[]) => {
                if (!old) return old;

                return old.map(sub => sub.id === variables.subscriptionId ? { ...sub, status: variables.status } : sub);
            });


            return { previousSubscription: previousSubscriptions };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousSubscription) {
                queryClient.setQueryData(['allSubscriptions'], context.previousSubscription);
            }
        }
    });

    return {
        subscription: subscriptionQuery.data,
        isLoadingSubscription: subscriptionQuery.isLoading,
        isErrorSubscription: subscriptionQuery.isError,
        allSubscriptions: allSubscriptionsQuery.data,
        isLoadingAllSubscriptions: allSubscriptionsQuery.isLoading,
        isErrorAllSubscriptions: allSubscriptionsQuery.isError,
        createSubscription: createSubscription.mutateAsync,
        isCreating: createSubscription.isPending,
        deleteSubscription: deleteSubscription.mutateAsync,
        isDeleting: deleteSubscription.isPending,
        updateSubscription: updateSubscription.mutateAsync,
        isUpdating: updateSubscription.isPending,
    }
}

export default useSubscription