import { Link } from "react-router-dom";
import { ScanResponse } from "../App";

function SearchResult({ id, imgUrl, title, author }: Partial<ScanResponse>) {
    return (
        <Link to={`/details/${id}`}>
            <div className="flex gap-2 text-white">
                <img
                    src={imgUrl}
                    alt={title}
                    className="w-2/6 h-40 object-cover"
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
