import {
    createContext,
    ReactNode,
    useState,
    useContext,
    useEffect,
} from "react";
import api from "../libs/api";
import { cloudStorage } from "@telegram-apps/sdk-react";

type Alert = {
    id: string;
    message: string;
    type: "info" | "danger" | "warning";
};

type AlertContextType = {
    showAlert: boolean;
    setShowAlert: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
    alert: Alert | null;
};

const AlertContext = createContext<AlertContextType>({
    showAlert: false,
    setShowAlert: () => {},
    alert: null,
});

export const AlertContextProvider = ({ children }: { children: ReactNode }) => {
    const [showAlert, setShowAlert] = useState(false); // state should be fetch from server
    const [alert, setAlert] = useState<Alert | null>(null);

    useEffect(() => {
        const fetchAlert = async () => {
            try {
                const { data, status } = await api.get("/alert");

                if (status !== 200 || !data.id) return;

                const result = (await cloudStorage.getItem(
                    "alert"
                )) as unknown as {
                    [index: string]: string;
                };

                if (!result || result["alert"] == "") {
                    await cloudStorage.setItem(
                        "alert",
                        JSON.stringify([data.id])
                    );

                    setAlert(data);
                    setShowAlert(true);

                    return;
                }

                const alertIdArr: Array<string> = JSON.parse(result["alert"]);
                const isInList = alertIdArr.find((AId) => AId == data.id);

                if (isInList) return;

                await cloudStorage.setItem(
                    "alert",
                    JSON.stringify([data.id, ...alertIdArr])
                );

                setAlert(data);
                setShowAlert(true);
            } catch (error) {
                console.log(error);
            }
        };

        fetchAlert();
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, setShowAlert, alert }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
