import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ScanResponse } from "../App";
import { Card, LoadingSpinner } from "../components";
import { Page } from "../components/Page";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import api from "../libs/api";
import Loading from "../components/Loading";
import { useInView } from "react-intersection-observer";
import useSafeArea from "../hooks/useSafeArea";

const splitArray = (arr: ScanResponse[], size: number) => {
    const results = [];

    for (let i = 0; i < arr.length; i += size) {
        results.push(arr.slice(i, i + size));
    }

    return results;
};

const More = () => {
    const params = useParams();
    const { inView, ref } = useInView({
        threshold: 0.1,
    });

    const { top, bottom } = useSafeArea();

    const fetchMore = async ({
        pageParam = 1,
    }: any): Promise<ScanResponse[]> => {
        const { data, status } = await api.get(
            `/more?id=${params.id}&page=${pageParam}`
        );

        if (status != 200) {
            throw new Error("Network response was not ok");
        }

        return data;
    };

    const {
        data: scans,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        refetch,
    } = useInfiniteQuery<ScanResponse[], Error>({
        queryKey: [`more_${params.id}`],
        queryFn: fetchMore,
        getNextPageParam: (lastPage, pages) =>
            lastPage.length == 2 ? pages?.length + 1 : undefined,
        initialPageParam: 1,
    });

    useEffect(() => {
        if (inView && !isLoading && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, isLoading]);

    if (isLoading) {
        return (
            <Page>
                <div className="flex flex-col justify-center items-center h-screen w-screen overflow-y-hidden text-white">
                    <Loading />
                    <p className="text-xs text-slate-400 mt-4">
                        Chargement des données...
                    </p>
                </div>
            </Page>
        );
    }

    if (!isLoading && (error || !scans)) {
        return (
            <Page>
                <div className="h-screen flex flex-col justify-center items-center text-white">
                    <h1 className="text-2xl capitalize">
                        An unknown error occured
                    </h1>
                    <button
                        className="bg-red-600 px-3 py-2 rounded-lg mt-2 text-sm"
                        onClick={() => refetch()}
                    >
                        Try Again
                    </button>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <section
                className="p-3 lg:max-w-[700px] mx-auto"
                style={{
                    marginTop: top,
                }}
            >
                <h1 className="text-white text-3xl mb-3 capitalize">
                    {params.id == "recent" ? "Récemment Ajouté" : params.id}
                </h1>

                <div className="flex flex-col">
                    {splitArray(
                        scans?.pages.flatMap((arr) => arr) || [],
                        3
                    ).map((group) => (
                        <div className="grid grid-cols-3 gap-2">
                            {group.map((scan) => (
                                <Card
                                    key={scan?.id}
                                    id={scan.scanId}
                                    imgUrl={scan.imgUrl}
                                    stars={scan.stars}
                                    title={scan.title}
                                    helpPath="../"
                                    isMore={true}
                                />
                            ))}
                        </div>
                    ))}
                    {/* {scans?.pages.map((group) =>
                        group.map((scan) => (
                            <Card
                                key={scan?.id}
                                id={scan.scanId}
                                imgUrl={scan.imgUrl}
                                stars={scan.stars}
                                title={scan.title}
                                helpPath="../"
                                isMore={true}
                            />
                        ))
                    )} */}
                </div>

                <div
                    ref={ref}
                    className="w-full min-h-5"
                    style={{
                        paddingBottom: bottom,
                    }}
                >
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center w-full mt-3">
                            <Loading />
                            <p className="text-xs text-slate-400 mt-2">
                                Chargement...
                            </p>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </section>
        </Page>
    );
};

export default More;
