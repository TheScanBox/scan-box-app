import LoaderGif from "../assets/loader.gif";

const Loading = () => {
    return (
        <div className="relative flex justify-center items-center">
            <img src={LoaderGif} className="w-8 h-8" />
        </div>
    );
};

export default Loading;
