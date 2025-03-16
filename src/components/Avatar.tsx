import { Link } from "react-router-dom";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";

function Avatar() {
    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;

    return (
        <Link to="/profile">
            {user?.photo_url ? (
                <img
                    className="w-full h-full rounded-full object-cover cursor-pointer"
                    src={
                        user.photo_url ??
                        "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/viral-hit.jpg"
                    }
                    alt={user.first_name}
                />
            ) : (
                <div className="w-full h-full rounded-full cursor-pointer bg-slate-700 animate-pulse" />
            )}
        </Link>
    );
}

export default Avatar;
