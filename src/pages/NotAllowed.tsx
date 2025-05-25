import QrCode from "../assets/qr_code.png";

const NotAllowed = () => {
    return (
        <div className="flex flex-col h-screen items-center justify-center">
            <img src={QrCode} className="w-48 h-48" />

            <p className="text-white text-center text-sm mt-3 w-4/5">
                ScanBox n'est actuellement pas disponible sur votre appariel.
                Scanner le QR code pour l'ouvrir sur mobile
            </p>
        </div>
    );
};
export default NotAllowed;
