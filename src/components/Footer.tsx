import { openTelegramLink } from "@telegram-apps/sdk-react";

function Footer() {
    return (
        <div className="flex justify-center w-full items-center absolute bottom-0">
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
