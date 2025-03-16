import { CiStar } from "react-icons/ci";
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
                isMore ? "w-full flex-1 max-w-30" : "min-w-32 w-32"
            }`}
            onClick={() =>
                navigate(`${helpPath ? helpPath : ""}../details/${id}`)
            }
        >
            <div
                className="w-full h-36 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${imgUrl})`,
                }}
            />
            {/* <img src={imgUrl} className="w-full h-36 object-cover" alt="img" /> */}
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
