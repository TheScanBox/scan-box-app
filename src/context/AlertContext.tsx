import { createContext, ReactNode, useState, useContext } from "react";

type AlertContextType = {
    unavailable: boolean;
    setUnAvailable:
        | React.Dispatch<React.SetStateAction<boolean>>
        | (() => void);
};

const AlertContext = createContext<AlertContextType>({
    unavailable: false,
    setUnAvailable: () => {},
});

export const AlertContextProvider = ({ children }: { children: ReactNode }) => {
    const [unavailable, setUnAvailable] = useState(false); // state should be fetch from server

    return (
        <AlertContext.Provider value={{ unavailable, setUnAvailable }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
