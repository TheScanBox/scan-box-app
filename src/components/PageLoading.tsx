import Loading from "./Loading";

const PageLoading = () => {
    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            <Loading />
            <p className="text-xs text-slate-400 mt-4">
                Chargement des données...
            </p>
        </div>
    );
};
export default PageLoading;
