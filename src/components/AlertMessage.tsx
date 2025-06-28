import { IoMdClose } from "react-icons/io";
import useSafeArea from "../hooks/useSafeArea";
import { useAlert } from "../context/AlertContext";

const Text = ({ htmlText }: { htmlText: string }) => (
    <div dangerouslySetInnerHTML={{ __html: htmlText }} />
);

const AlertMessage = () => {
    const { top } = useSafeArea();
    const { setShowAlert, showAlert, alert } = useAlert();

    return (
        <>
            {showAlert && (
                <div
                    className={`w-full py-1 text-center text-xs z-50 flex flex-row justify-between items-center px-3 ${
                        alert?.type == "danger"
                            ? "bg-red-500 text-white"
                            : alert?.type == "warning"
                            ? "bg-yellow-400 text-black"
                            : "bg-blue-500 text-white"
                    }`}
                    style={{
                        paddingTop: top,
                    }}
                >
                    <Text htmlText={alert?.message || ""} />

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
