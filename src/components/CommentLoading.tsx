const CommentLoading = ({ isReply = false }: { isReply?: boolean }) => {
    return (
        <div className={`p-3 flex flex-col gap-2 border-t border-slate-700 ${isReply ? "ml-6" : "w-full"}`}>
            <div className="flex items-center gap-2 w-full">
                <div className="w-9 h-9 flex rounded-full bg-slate-700 animate-pulse" />
                <div className="flex flex-col gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded animate-pulse" />
                    <div className="w-16 h-1.5 bg-slate-700 rounded animate-pulse" />
                </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded animate-pulse" />
            <div className="w-full h-2 bg-slate-700 rounded animate-pulse" />
            <div className="w-3/4 h-2 bg-slate-700 rounded animate-pulse" />
            <div className={`flex items-center mt-2 ${isReply ? "justify-end" : "justify-between"}`}>
                <div className={`w-16 h-6 bg-slate-700 rounded animate-pulse ${isReply && "hidden"}`} />
                <div className="flex gap-2">
                    <div className="w-10 h-6 bg-slate-700 rounded animate-pulse" />
                    <div className="w-10 h-6 bg-slate-700 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default CommentLoading;