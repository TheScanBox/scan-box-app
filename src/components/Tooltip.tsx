import { useSafeArea } from "@/context/SafeAreaContext";
import { IoMdArrowDropdown } from "react-icons/io"

type TooltipProps = {
    show?: boolean;
    text: string;
};

const Tooltip = ({ text, show = false }: TooltipProps) => {
    const { bottom } = useSafeArea();

    // This component is used to display a tooltip for leaving a comment
    // It is positioned at the bottom center of the screen
    // and includes an arrow pointing downwards
    return (
        <div
            style={{ marginBottom: bottom ? bottom + 80 : "8rem" }}
            hidden={!show}
            className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 min-w-[150px] px-4 py-4 bg-black/90 text-white rounded-full shadow-lg z-50 select-none"
        >
            <p className="text-[0.6rem]">{text}</p>

            <div className="w-6 h-6 mt-1 absolute -bottom-3 left-1/3">
                <IoMdArrowDropdown size={32} className="text-black/90" />
            </div>

        </div>
    )
}

export default Tooltip