type ProgressBarType = {
    scrollProgress: number;
};

const ProgressBar = ({ scrollProgress }: ProgressBarType) => {
    return (
        <div
            className="fixed bottom-0 left-0 h-1 bg-blue-500 transition-[width] duration[0.2s] ease-out z-50"
            style={{
                width: `${scrollProgress >= 95 ? 100 : scrollProgress}%`,
            }}
        />
    );
};
export default ProgressBar;
