import { useLocation, useNavigate } from "react-router-dom";

function NotFound() {
    const location = useLocation();
    const navigate = useNavigate();

    console.log("page not found", location.pathname);

    return (
        <div className="h-screen flex flex-col justify-center items-center text-white">
            <h1 className="text-2xl ">Page Not Found</h1>
            {/* {location.pathname} */}
            <button
                className="text-slate-500 underline cursor-pointer"
                onClick={() => navigate("/home")}
            >
                Back to Home
            </button>
        </div>
    );
}

export default NotFound;
