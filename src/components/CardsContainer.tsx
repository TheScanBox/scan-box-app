import { IoIosArrowForward } from "react-icons/io";
import { ScanResponse } from "../App";
import Card from "./Card";
import { Link } from "react-router-dom";
import CardLoading from "./Loading/CardLoading";

type CardsContainerProps = {
    title: string;
    data?: ScanResponse[];
    id: string;
    loading: boolean;
    error: Error | null;
};

function CardsContainer({
    title,
    data,
    id,
    loading,
    error,
}: CardsContainerProps) {
    if (loading)
        return (
            <section className="mt-4 animate-pulse">
                <div className="w-2/6 h-3 bg-slate-700 mb-2" />
                <div className="flex gap-2 overflow-x-auto no-scrollbar animate-pulse">
                    <CardLoading />
                    <CardLoading />
                    <CardLoading />
                    <CardLoading />
                </div>
            </section>
        );

    if (!loading && error)
        return (
            <section className="mt-4">
                <h1 className="text-white mb-1 text-lg flex justify-between">
                    {title}
                </h1>

                <div className="text-white flex flex-col justify-center items-center">
                    <h1 className="text-sm capitalize">
                        An unknown error occured
                    </h1>
                </div>
            </section>
        );

    return (
        <section className="mt-4">
            <h1 className="text-white mb-1 flex justify-between">
                <span className="text-xl">{title}</span>
                <Link
                    to={`../more/${id}`}
                    className="flex items-center gap-1 text-slate-400 cursor-pointer"
                >
                    <span className="text-xs">Voir Plus</span>
                    <IoIosArrowForward className="font-bold text-xs" />
                </Link>
            </h1>

            <div className=" flex gap-2 overflow-x-auto no-scrollbar">
                {!!data?.length &&
                    data?.map((scan) => (
                        <Card key={scan?.id} {...scan} id={scan.scanId} />
                    ))}
            </div>
        </section>
    );
}

export default CardsContainer;
