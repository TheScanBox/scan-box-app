import { useState, useEffect, useRef } from "react";
import { IoMdSunny } from "react-icons/io";
import { useSafeArea } from "@/context/SafeAreaContext";

type SliderType = {
    min: number;
    max: number;
    value: number;
    step: number;
    onChange: (v: number) => void;
};

const VerticalSlider = ({
    min = 0,
    max = 100,
    value = 50,
    step = 1,
    onChange,
}: SliderType) => {
    const { top } = useSafeArea();

    const [sliderValue, setSliderValue] = useState(value);
    const trackRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setSliderValue(value);
    }, [value]);

    const calculateValueFromY = (clientY: number) => {
        const rect = trackRef.current?.getBoundingClientRect();

        if (!rect) return;

        const clickY = clientY - rect.top;
        const percent = 1 - clickY / rect.height;
        const newValue =
            Math.round((min + percent * (max - min)) / step) * step;
        return Math.max(min, Math.min(max, newValue));
    };

    const updateValue = (clientY: number) => {
        const newValue = calculateValueFromY(clientY);
        setSliderValue(newValue!);

        onChange && onChange(newValue!);
    };

    const startDrag = () => {
        const moveHandler = (moveEvent: any) => {
            moveEvent.preventDefault(); // Prevent background scroll

            const clientY =
                moveEvent.touches?.[0]?.clientY ?? moveEvent.clientY;
            updateValue(clientY);
        };

        const stopDrag = () => {
            document.removeEventListener("mousemove", moveHandler);
            document.removeEventListener("mouseup", stopDrag);
            document.removeEventListener("touchmove", moveHandler, {
                capture: false,
            });
            document.removeEventListener("touchend", stopDrag);
        };

        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchmove", moveHandler, { passive: false });
        document.addEventListener("touchend", stopDrag);
    };

    const handleClick = (e: any) => {
        const clientY = e.touches?.[0]?.clientY ?? e.clientY;

        updateValue(clientY);
    };

    const percent = ((sliderValue - min) / (max - min)) * 100;

    return (
        <div
            className="fixed py-4 px-2 rounded-lg bg-black/90 right-4 z-50"
            style={{
                top: top ? `calc(${top}px + 4.5rem)` : "4.5rem",
            }}
        >
            <div className="text-white text-center text-xs mb-2">
                {percent.toFixed(0)}%
            </div>
            <div className="h-64 w-12 flex items-center justify-center">
                <div
                    ref={trackRef}
                    className="relative w-2 bg-white rounded-full h-full cursor-pointer"
                    onMouseDown={handleClick}
                    onTouchStart={handleClick}
                >
                    <div
                        className="absolute left-0 w-full bg-gray-700 rounded-full"
                        style={{ bottom: 0, height: `${percent}%` }}
                    />

                    <div
                        className="absolute left-1/2 -mb-2 -translate-x-1/2 bg-gray-300 w-4 h-4 rounded-full cursor-grab"
                        style={{ bottom: `${percent}%` }}
                        onMouseDown={startDrag}
                        onTouchStart={startDrag}
                    />
                </div>
            </div>

            <div className="text-white flex justify-center items-center mt-2">
                <IoMdSunny size={20} />
            </div>
        </div>
    );
};
export default VerticalSlider;
