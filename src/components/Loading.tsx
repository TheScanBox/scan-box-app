const Loading = () => {
    return (
        <div className="relative flex justify-center items-center">
            <div className="relative">
                <div className="animate-spin-reverse">
                    <svg className="h-7 w-7" viewBox="0 0 36 36">
                        <path
                            d="
                  M18 2
                  a 16 16 0 1 1 -12.445 27.445"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Loading;
