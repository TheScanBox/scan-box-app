import { useParams } from "react-router-dom";
import { Page } from "../components/Page";

type ParamsType = { id: string };

const Comments = () => {
    const params = useParams() as ParamsType;

    return (
        <Page>
            <div className="h-screen flex justify-center items-center">
                <p className="text-white">Comments {params.id}</p>
            </div>
        </Page>
    );
};
export default Comments;
