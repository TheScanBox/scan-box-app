import { useNavigate } from "react-router-dom";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { useState } from "react";

function Avatar() {
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);
    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;

    return (
        <div
            onClick={() => navigate("/profile")}
            className={`w-full h-full rounded-full cursor-pointer bg-slate-700 ${imageLoaded ? "" : "animate-pulse"}`}
        >
            <img
                className="w-full h-full rounded-full object-cover"
                src={user?.photo_url}
                alt={user?.first_name || "User"}
                onLoad={() => setImageLoaded(true)}
            />
        </div>
    );
}

export default Avatar;
