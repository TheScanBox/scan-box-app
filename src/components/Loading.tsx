import LoaderGif from "../assets/loader.gif";

type LoadingProps = {
    className?: string;
    loadingText?: string
};

const Loading = ({ className, loadingText }: LoadingProps) => {
    return (
        <div className={`flex flex-col items-center gap-3 justify-center`}>
            <div className="rounded-full">
                <svg
                    className={`animate-spin-slow ${className || 'h-6 w-6 text-slate-400'}`}
                    viewBox="0 0 36 36"
                    fill="none"
                >
                    <path
                        d="M18 2 A16 16 0 1 1 2 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {loadingText && (<span className="text-xs text-slate-400">{loadingText}</span>)}
        </div>
    );
};

export default Loading;
