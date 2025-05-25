import { openTelegramLink } from "@telegram-apps/sdk-react";
import useSafeArea from "../hooks/useSafeArea";

function Footer() {
    const { bottom } = useSafeArea();
    return (
        <div
            className={`flex justify-center w-full items-center mt-5 ${
                !bottom && "pb-3"
            }`}
        >
            <p className="text-slate-500 text-xs">
                Made With <span className="text-red-600">❤</span> By{" "}
                <span
                    className="underline font-bold"
                    onClick={() => openTelegramLink("https://t.me/TheScanBox")}
                >
                    TheScanBox
                </span>
            </p>
        </div>
    );
}

export default Footer;
