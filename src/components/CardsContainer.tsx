import { IoIosArrowForward } from "react-icons/io";
import { ScanResponse } from "../App";
import Card from "./Card";
import { Link } from "react-router-dom";
import CardLoading from "./Loading/CardLoading";
import { BookmarkScan, FavoriteScan } from "@/types";
import { useRef, useState } from "react";

type CardsContainerProps = {
    title: string;
    data?: ScanResponse[] | FavoriteScan[] | BookmarkScan[];
    id: string;
    loading: boolean;
    error: Error | null;
};

type ScrollDiv = HTMLDivElement & {
    isDown?: boolean;
    startX?: number;
    scrollLeftStart?: number;
};

function CardsContainer({
    title,
    data,
    id,
    loading,
    error,
}: CardsContainerProps) {
    const scrollRef = useRef<ScrollDiv>(null);
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollStartRef = useRef(0);

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = scrollRef.current;
        if (!el) return;

        el.isDown = true;
        startXRef.current = e.pageX;
        scrollStartRef.current = el.scrollLeft;
        isDraggingRef.current = false;
        setIsDragging(false); // reset state for click-blocking in children
    };

    const onMouseLeave = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.isDown = false;
    };

    const onMouseUp = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.isDown = false;
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = scrollRef.current;
        if (!el || !el.isDown) return;

        const dx = e.pageX - startXRef.current;
        if (Math.abs(dx) > 5) {
            isDraggingRef.current = true;
            setIsDragging(true); // update state for click-blocking in children
        }

        el.scrollLeft = scrollStartRef.current - dx;
    };

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

            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing"
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
            >
                {!!data?.length &&
                    data?.map((scan: ScanResponse | FavoriteScan | BookmarkScan) => (
                        <Card
                            key={scan?.id}
                            {...scan}
                            id={scan.scanId}
                            parentId={scan.scanParentId}
                            type={undefined}
                            isDragging={isDragging}
                        />
                    ))}
            </div>
        </section>
    );
}

export default CardsContainer;
// filepath: c:\Programming\Projects\scan-
