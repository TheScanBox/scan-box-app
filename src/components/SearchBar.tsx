import { CiSearch } from "react-icons/ci";
import Avatar from "./Avatar";
import { ChangeEvent } from "react";

type SearchBarProps = {
    search: string;
    handleSearch: (searchText: string) => void;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
};

function SearchBar({ search, handleSearch, setSearch }: SearchBarProps) {
    return (
        <div className={`w-full flex items-center gap-2 h-10`}>
            <div className="flex bg-slate-700 rounded-lg w-screen gap-2 h-full items-center p-2 relative">
                <CiSearch
                    fontWeight={100}
                    size={24}
                    color="#d1d5db"
                    className="cursor-pointer"
                />
                <input
                    value={search}
                    className="w-full h-full bg-slate-700 text-white outline-none placeholder:font-normal"
                    placeholder="Recherche un scan..."
                    onChange={(e) => handleSearch(e.target.value)}
                />

                <div
                    onClick={() => setSearch("")}
                    className={`${search ? "flex" : "hidden"
                        } absolute right-3 h-full flex-col justify-center items-center w-4 cursor-pointer`}
                >
                    <img src="./close.svg" alt="close-btn" />
                </div>
            </div>

            {/* {search && (
                <div className="cursor-pointer">
                    <p className="text-slate-400 text-xs">Annuler</p>
                </div>
            )} */}

            {!search && (
                <div className="max-w-10 max-h-10 min-w-10 min-h-10 w-10 h-10 flex justify-center rounded-full">
                    <Avatar />
                </div>
            )}
        </div>
    );
}

export default SearchBar;
