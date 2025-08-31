import { CiSearch } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

type SearchBarProps = {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
};

const SearchBar = ({ searchTerm, setSearchTerm }: SearchBarProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2 w-full p-3">
            <div className="flex bg-slate-700 rounded-lg w-full gap-2 h-full items-center p-2 relative">
                <CiSearch
                    fontWeight={100}
                    size={24}
                    color="#d1d5db"
                    className="cursor-pointer"
                />
                <input
                    value={searchTerm}
                    className="w-full h-full bg-slate-700 text-white outline-none placeholder:font-normal"
                    placeholder="Recherche..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

            </div>
            <button
                onClick={() => navigate(-1)}
                className="text-slate-400 text-sm cursor-pointer"
            >
                <IoClose size={20} />
            </button>
        </div>
    )
}

export default SearchBar