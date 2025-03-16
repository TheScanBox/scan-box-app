import { BackButton } from "@twa-dev/sdk/react";
import { useLocation, useNavigate } from "react-router-dom";

function NotFound() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col justify-center items-center text-white">
            <h1 className="text-2xl ">Page Not Found</h1>
            {/* {location.pathname} */}
            <BackButton />
            <button
                className="text-slate-500 underline"
                onClick={() => navigate("/")}
            >
                Back to Home
            </button>
        </div>
    );
}

export default NotFound;
