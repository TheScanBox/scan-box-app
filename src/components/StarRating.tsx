import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

type StarRatingType = {
    initial?: number; // 1-10 scale
    onRate?: (rate: number) => void;
    readOnly?: boolean;
};

type ControlEvent =
    | React.MouseEvent<HTMLSpanElement, MouseEvent>
    | React.TouchEvent<HTMLSpanElement>;

const StarRating = ({
    initial = 0,
    onRate,
    readOnly = false,
}: StarRatingType) => {
    // Convert initial 1-10 scale to 0-5 star scale
    const [rating, setRating] = useState(initial / 2);
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const getDisplayRating = () => hoverRating ?? rating;

    // Converts star index and half/full click to 1-10 scale
    const getValueFromEvent = (e: ControlEvent, index: number) => {
        let clientX;
        if ("touches" in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const isHalf = clientX - left < width / 2;
        // Star value: 0.5 to 5, convert to 1-10 scale
        const starValue = isHalf ? index + 0.5 : index + 1;
        return starValue * 2;
    };

    const handleClick = (e: ControlEvent, index: number) => {
        if (readOnly) return;
        const value = getValueFromEvent(e, index);
        setRating(value / 2);
        if (onRate) onRate(value);
    };

    const handleHover = (e: ControlEvent, index: number) => {
        if (readOnly || "touches" in e) return;
        const value = getValueFromEvent(e, index);
        setHoverRating(value / 2);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLSpanElement>) => {
        if (readOnly) return;
        const touch = e.touches[0];
        let el = document.elementFromPoint(touch.clientX, touch.clientY) as any;
        while (el && !el.dataset?.starIndex) {
            el = el.parentElement;
        }
        if (!el?.dataset?.starIndex) return;
        const index = parseInt(el.dataset.starIndex, 10);
        const value = getValueFromEvent(e, index);
        setRating(value / 2);
        if (onRate) onRate(value);
    };

    const handleMouseLeave = () => {
        if (!readOnly) setHoverRating(null);
    };

    return (
        <div
            className="flex flex-row items-center"
            onTouchMove={handleTouchMove}
            style={{ touchAction: "pan-y" }}
        >
            {Array.from({ length: 5 }, (_, i) => {
                const value = getDisplayRating();
                let icon;
                if (value >= i + 1) {
                    icon = <FaStar className="text-yellow-400" />;
                } else if (value >= i + 0.5) {
                    icon = <FaStarHalfAlt className="text-yellow-400" />;
                } else {
                    icon = <FaRegStar className="text-gray-200" />;
                }
                return (
                    <span
                        key={i}
                        data-star-index={i}
                        className="cursor-pointer text-2xl transition-colors flex items-center justify-center select-none w-8 h-8"
                        onClick={(e) => handleClick(e, i)}
                        onMouseMove={(e) => handleHover(e, i)}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={(e) => handleClick(e, i)}
                    >
                        {icon}
                    </span>
                );
            })}
            <span className="text-slate-300 w-7 h-7 text-xs flex items-center justify-center">
                {` (${hoverRating ? (hoverRating * 2).toFixed(1) : (rating * 2).toFixed(1)})`}
            </span>
        </div>
    );
};
export default StarRating;
