import { LuArrowDownUp } from "react-icons/lu";

type ScanListHeaderType = {
    numChap: number;
    order: "desc" | "asc";
    numPages: number;
    specialChaptersLength: number;
    setOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};

const ScanListHeader = ({
    numChap,
    specialChaptersLength,
    setOrder,
    order,
    setCurrentPage,
    numPages,
}: ScanListHeaderType) => {
    const totalChapters = numChap - specialChaptersLength;
    return (
        <div className="text-slate-300 flex justify-between items-center w-full px-3">
            <h1 className="text-sm">
                Chapitres - {totalChapters < 0 ? 0 : totalChapters}
            </h1>
            <div
                onClick={() => {
                    setOrder(order === "asc" ? "desc" : "asc");
                    setCurrentPage(order === "asc" ? numPages : 1);
                }}
                className="flex cursor-pointer"
            >
                <span className="text-sm">Trier</span>
                <LuArrowDownUp size={15} />
            </div>
        </div>
    );
};
export default ScanListHeader;
