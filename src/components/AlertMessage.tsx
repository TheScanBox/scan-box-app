import { IoMdClose } from "react-icons/io";
import { useAlert } from "../context/AlertContext";
import { useSafeArea } from "@/context/SafeAreaContext";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import useUser from "@/hooks/useUser";
import api from "@/libs/api";

const Text = ({ htmlText }: { htmlText: string }) => (
    <div dangerouslySetInnerHTML={{ __html: htmlText }} />
);

const alertStyles = {
    DANGER: "bg-[#662b2b] text-[#f9caca]",
    WARNING: "bg-[#665426] text-[#ffe7a3]",
    INFO: "bg-[#2b4a66] text-[#cde5f8]",
};


const AlertMessage = () => {
    const { top } = useSafeArea();
    const { setShowAlert, showAlert, alert } = useAlert();
    const { pathname } = useLocation()
    const user = useUser();

    useEffect(() => {
        if (!showAlert || !alert || !user?.id || pathname == "/") return;

        const markAsSeen = async () => {
            try {
                await api.post(`/alert/${alert.id}/seen`, {
                    userId: String(user?.id)
                });
            } catch (error) {
                console.error("Failed to mark alert as seen:", error);
            }
        };

        markAsSeen();
    }, [showAlert, alert, user?.id, pathname]);

    if (!showAlert || !alert || pathname == "/") return null;

    return (
        <>
            {showAlert && (
                <div
                    className={`w-full ${!top ? "py-3" : "py-1"} text-center text-xs z-50 flex flex-row justify-between items-center px-3 sticky top-0 ${alertStyles[alert.type]}`}
                    style={{
                        paddingTop: top ? top : "",
                    }}
                >
                    <Text htmlText={alert.message} />
                    <div
                        className="cursor-pointer min-w-6 flex justify-center items-center"
                        onClick={() => setShowAlert(false)}
                    >
                        <IoMdClose size={17} />
                    </div>
                </div>
            )}
        </>
    );
};
export default AlertMessage;
