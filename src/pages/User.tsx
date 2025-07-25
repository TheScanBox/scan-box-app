import { CardsContainer } from "@/components";
import CardLoading from "@/components/Loading/CardLoading";
import { Page } from "@/components/Page";
import { useSafeArea } from "@/context/SafeAreaContext";
import useUser from "@/hooks/useUser";
import { CiSearch } from "react-icons/ci";
import { useParams } from "react-router-dom";

const User = () => {
    const { userId } = useParams<{ userId: string }>();
    const user = useUser()
    const { top, bottom } = useSafeArea()
    // Here you can fetch user data based on userId
    // For example, using a custom hook or an API call


    return (
        <Page>
            <div
                className="p-3 text-white lg:max-w-[700px] mx-auto relative flex flex-col gap-3"
                style={{
                    marginTop: top ? top : 0,
                    marginBottom: bottom ? bottom : 0
                }}
            >
                <div className="flex flex-col gap-3 items-center justify-cente w-full">
                    <div className="flex justify-end w-full">
                        <CiSearch
                            size={24}
                            className="cursor-pointer font-bold"
                        />
                    </div>
                    <div className="w-32 h-32 rounded-full relative">
                        <img
                            src={user?.photo_url}
                            className="w-full h-full object-cover rounded-full"
                            alt={user?.first_name || ""}
                        />
                        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold">
                            {user?.first_name}
                        </h1>
                        <p className="text-xs text-slate-500">
                            @{user?.username}
                        </p>
                    </div>
                </div>

                <div className="">
                    <CardsContainer
                        title="Manga"
                        id={"manga"}
                        data={[]}
                        loading={true}
                        error={null}
                    />

                    <CardsContainer
                        title="Manga"
                        id={"manga"}
                        data={[]}
                        loading={true}
                        error={null}
                    />

                    <CardsContainer
                        title="Manga"
                        id={"manga"}
                        data={[]}
                        loading={true}
                        error={null}
                    />
                </div>
            </div>
        </Page>
    )
}

export default User