function CardLoading() {
    return (
        <div className="w-32 active:opacity-5">
            <div className="w-32 h-40 bg-slate-700" />
            <div className="flex flex-col text-white text-xs mt-1 gap-1 w-full">
                <div className="h-2 w-32 bg-slate-700 rounded" />
                <div className="h-2 w-9 bg-slate-700 rounded" />
            </div>
        </div>
    );
}

export default CardLoading;
