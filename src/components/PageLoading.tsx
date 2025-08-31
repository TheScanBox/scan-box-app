import Loading from "./Loading";

const PageLoading = () => {
    // const { pathname } = useLocation();

    // const getLoadingMessage = () => {
    //     switch (true) {
    //         case pathname.startsWith("/scan/"):
    //             return "Chargement du scan...";
    //         case pathname.startsWith("/user/"):
    //             return "Chargement du profile...";
    //         case pathname === "/profile":
    //             return "Chargement de votre profile...";
    //         case pathname === "/":
    //             return "Chargement de la page d'accueil...";
    //         default:
    //             return "Chargement des données...";
    //     }
    // }

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            <Loading />
            {/* <p className="text-xs text-slate-400 mt-4">
                {getLoadingMessage()}
            </p> */}
        </div>
    );
};
export default PageLoading;
