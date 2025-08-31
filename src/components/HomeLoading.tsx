import SearchBar from "./SearchBar";
import CardLoading from "./Loading/CardLoading";
import Footer from "./Footer";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useAlert } from "../context/AlertContext";

function HomeLoading() {
    const { top } = useSafeArea();
    const { showAlert } = useAlert();

    return (
        <section
            className="relative md:max-w-[700px] mx-auto"
            style={{
                marginTop: showAlert ? 0 : top,
            }}
        >
            <div className="p-3 pb-8">
                <SearchBar
                    search=""
                    setSearch={() => { }}
                    handleSearch={() => { }}
                />
                <div className="w-full h-48 mt-4 rounded-lg relative animate-pulse  bg-slate-700">
                    <div className="absolute bottom-0 p-2 text-white w-full flex justify-between items-center">
                        <div className="w-full space-y-2">
                            <div className="h-2 w-6/12  bg-slate-800 rounded" />
                            <div className="h-2 w-1/3 bg-slate-800 rounded" />
                        </div>
                    </div>
                </div>

                <section className="mt-4 animate-pulse">
                    <div className="w-2/6 h-3 bg-slate-700 mb-2" />
                    <div className="flex gap-2 overflow-x-auto no-scrollbar animate-pulse">
                        <CardLoading />
                        <CardLoading />
                        <CardLoading />
                        <CardLoading />
                    </div>
                </section>
                <section className="mt-4 animate-pulse">
                    <div className="w-2/6 h-3 bg-slate-700 mb-2" />
                    <div className="flex gap-2 overflow-x-auto no-scrollbar animate-pulse">
                        <CardLoading />
                        <CardLoading />
                        <CardLoading />
                        <CardLoading />
                    </div>
                </section>
                <section className="mt-4 animate-pulse">
                    <div className="w-2/6 h-3 bg-slate-700 mb-2" />
                    <div className="flex gap-2 overflow-x-auto no-scrollbar animate-pulse">
                        <CardLoading />
                        <CardLoading />
                        <CardLoading />
                        <CardLoading />
                    </div>
                </section>
            </div>
            <Footer />
        </section>
    );
}

export default HomeLoading;
