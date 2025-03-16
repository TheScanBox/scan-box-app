import { useEffect, useState } from "react";
import SearchResult from "./SearchResult";
import { ScanResponse } from "../App";
import LoadingSpinner from "./Loading/LoadingSpinner";
import Loading from "./Loading";
import { openTelegramLink } from "@telegram-apps/sdk-react";
import { useQuery } from "@tanstack/react-query";
import api from "../libs/api";

type SearchScreenProps = {
    debouncedSearchText: string;
};

const fetchResults = async (query: string) => {
    const { data, status } = await api.get(`/search?q=${query.toLowerCase()}`);

    if (status != 200) {
        throw new Error("Network response was not ok");
    }

    return data;
};

function SearchScreen({ debouncedSearchText }: SearchScreenProps) {
    const {
        data: searchResults,
        isLoading,
        error,
    } = useQuery<ScanResponse[]>({
        queryKey: ["search", `${debouncedSearchText}`],
        queryFn: () => fetchResults(debouncedSearchText),
        enabled: debouncedSearchText.length > 0,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen overflow-y-hidden text-white">
                <Loading />
                <p className="text-xs text-slate-400 mt-2">Chargement...</p>
            </div>
        );
    }

    if (!isLoading && error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen overflow-y-hidden text-white">
                <p className="text-xs text-slate-400 mt-2">
                    Something Went Wrong...
                </p>
            </div>
        );
    }

    console.log("res", searchResults);

    return (
        <div className="mt-4 flex flex-col gap-3 h-screen">
            {!!searchResults?.length &&
                searchResults?.map((result) => (
                    <SearchResult
                        key={result.scanId}
                        {...result}
                        id={result.scanId}
                    />
                ))}

            {!searchResults?.length && (
                <div className="flex flex-col justify-center h-full items-center overflow-y-hidden text-white">
                    <h1 className="text-xl font-bold">Scan Not Found</h1>
                    <p
                        onClick={() =>
                            openTelegramLink(
                                "https://t.me/TheScanBoxSupportBot?start=utm_app"
                            )
                        }
                        className="text-xs text-red-400 mt-1 underline cursor-pointer hover:opacity-50"
                    >
                        Faites une demande d'ajout.
                    </p>
                </div>
            )}
        </div>
    );
}

export default SearchScreen;
