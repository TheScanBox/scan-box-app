import { CiStar } from "react-icons/ci";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link, useNavigate } from "react-router-dom";

type CardProps = {
    id: string;
    imgUrl: string;
    title: string;
    stars: number | string;
    helpPath?: string;
    isMore?: boolean;
};

function Card({
    imgUrl,
    title,
    stars,
    id,
    helpPath,
    isMore = false,
}: CardProps) {
    const navigate = useNavigate();

    return (
        <div
            className={`active:opacity-5 cursor-pointer ${
                isMore ? "w-full flex-1 " : "min-w-32 w-32"
            }`}
            onClick={() =>
                navigate(`${helpPath ? helpPath : ""}../details/${id}`)
            }
        >
            {/* <div
                className="w-full h-36 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${imgUrl})`,
                }}
            /> */}
            <div className="w-full h-40 relative">
                <LazyLoadImage
                    src={imgUrl}
                    className="w-full h-full object-cover object-center"
                    alt="img"
                    // placeholder={<img src="./loader.gif" />}
                    placeholder={
                        <div className="w-full h-full bg-slate-400 animate-pulse" />
                    }
                />
                <div className="absolute top-0 bottom-0 left-0 right-0 z-10" />
            </div>
            <div className="flex flex-col text-white text-xs mt-1 gap-1">
                <p className="truncate capitalize">{title}</p>
                <div className="flex justify-between">
                    <div className="flex gap-1 items-center">
                        <CiStar color="yellow" />
                        <p>{stars}</p>
                    </div>
                    {/* <div className="flex gap-1 items-center">
                        <CiStar color="yellow" />
                        <p>3</p>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default Card;
