import Comment from "@/components/Comment";
import Loading from "@/components/Loading";
import { Page } from "@/components/Page";
import useDebounce from "@/hooks/useDebounce";
import api from "@/libs/api";
import { CommentType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useAlert } from "@/context/AlertContext";
import ProfileRepliesContainer from "@/components/ProfileRepliesContainer";

type CommentSearchProps = {
    searchTerm?: string;
};

const UseCommentSearch = ({ searchTerm = "" }: CommentSearchProps) => {
    const searchComments = async (term: string) => {
        const res = await api.get(`/comments/search?q=${term}`);

        if (res.status !== 200) {
            throw new Error('Network response was not ok');
        }

        return res.data as CommentType[];
    }

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["comments_search", searchTerm],
        queryFn: () => searchComments(searchTerm),
        enabled: searchTerm.length >= 3,
    });

    return { data, isLoading, isError, refetch };
}

const CommentSearch = () => {
    const { bottom, top } = useSafeArea();
    const { showAlert } = useAlert();

    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, isLoading, isError, refetch } = UseCommentSearch({ searchTerm: debouncedSearch.toLowerCase() });

    return (
        <Page>
            <div
                className="text-white md:max-w-[700px] mx-auto"
                style={{ marginTop: showAlert ? 0 : top, paddingBottom: bottom + 16 }}
            >
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <h2 className="text-xl font-bold px-3">Mes Commentaires</h2>
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
                            <div className="text-xs sm:text-sm text-red-500">Une erreur est survenue lors de la recherche des commentaires. Veuillez réessayer.</div>
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
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Aucun commentaire trouvé pour "{searchTerm}".</div>
                    )
                }

                {
                    !isLoading && !isError && searchTerm.length > 0 && searchTerm.length < 3 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Veuillez entrer au moins 3 caractères pour lancer la recherche.</div>
                    )
                }

                {
                    !isLoading && !isError && searchTerm.length === 0 && (
                        <div className="text-xs sm:text-sm text-slate-400 mt-2 px-3">Utilisez la barre de recherche pour recherche vos commentaires.</div>
                    )
                }

                {
                    !isLoading && !isError && data && data.length > 0 && (
                        <div className="flex flex-col gap-4 mt-2">
                            {data.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSelectedCommentId(comment.id);
                                        setOpen(true);
                                    }}
                                >
                                    <Comment
                                        key={comment.id}
                                        {...comment}
                                    />
                                </div>
                            ))}
                        </div>
                    )
                }

                <ProfileRepliesContainer
                    open={open}
                    setOpen={setOpen}
                    commentId={selectedCommentId}
                />
            </div>
        </Page>
    )
}

export default CommentSearch