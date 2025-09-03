import { IoMdClose } from "react-icons/io";

type ActionPopupProps = {
    onClose?: () => void;
    onAction?: () => void;
};

const ActionPopup = ({ onAction, onClose }: ActionPopupProps) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-xs z-50 flex flex-row justify-center items-center">
            <div className="w-full max-w-xs bg-slate-800 text-slate-200 rounded-lg flex flex-col items-center px-3 py-4 gap-3 relative">
                <h1 className="text-lg font-bold">Rejoignez-nous 💬</h1>
                <div
                    onClick={onClose}
                    className="absolute top-2 right-2 hover:text-red-700 cursor-pointer"
                >
                    <IoMdClose size={20} />
                </div>
                <p className="text-xs break-words whitespace-pre-line text-center">Abonnez vous a notre canal Telegram pour supporter le projet et acceder a plus de fonctionnalites.</p>
                <button
                    onClick={onAction}
                    className="px-4 py-2 text-xs bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                    Rejoindre le canal Telegram
                </button>
            </div>
        </div>
    )
}

export default ActionPopup