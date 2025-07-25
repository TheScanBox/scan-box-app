import {
    createContext,
    ReactNode,
    useState,
    useContext,
    useEffect,
} from "react";
import axios from "axios";
import useUser from "@/hooks/useUser";

type Alert = {
    id: string;
    message: string;
    type: "INFO" | "DANGER" | "WARNING";
};

type AlertContextType = {
    showAlert: boolean;
    setShowAlert: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
    alert: Alert | null;
};

const AlertContext = createContext<AlertContextType>({
    showAlert: false,
    setShowAlert: () => { },
    alert: null,
});

export const AlertContextProvider = ({ children }: { children: ReactNode }) => {
    const [showAlert, setShowAlert] = useState(false); // state should be fetch from server
    const [alert, setAlert] = useState<Alert | null>(null);

    const user = useUser()

    useEffect(() => {
        const fetchAlert = async () => {
            if (!user?.id) return;

            try {
                const { data, status } = await axios.get(`${import.meta.env.VITE_API_URL}/alert?userId=${user?.id}`);

                if (status !== 200) return;

                setAlert(data);
                setShowAlert(true);
            } catch (error) {
                console.log(error);
            }
        };

        fetchAlert();
    }, [user?.id]);

    return (
        <AlertContext.Provider value={{ showAlert, setShowAlert, alert }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
