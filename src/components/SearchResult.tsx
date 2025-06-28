import { Link } from "react-router-dom";
import { ScanResponse } from "../App";
import { LazyLoadImage } from "react-lazy-load-image-component";

function SearchResult({
    id,
    imgUrl,
    title,
    author,
    scanParentId,
}: Partial<ScanResponse>) {
    return (
        <Link to={`/details/${id}/${scanParentId}`}>
            <div className="flex gap-2 text-white">
                <LazyLoadImage
                    src={imgUrl}
                    alt={title}
                    className="w-32 h-44 object-cover"
                    placeholder={
                        <div className="w-full h-full bg-slate-400 animate-pulse" />
                    }
                />
                <div>
                    <p className="capitalize text-lg">{title}</p>
                    <p className="text-xs text-slate-400 truncate">
                        By {author?.name || "Unknown Author"}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default SearchResult;
