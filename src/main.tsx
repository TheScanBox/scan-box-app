import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertContextProvider } from "./context/AlertContext.tsx";
import { init, miniAppReady } from "@telegram-apps/sdk-react";

const queryClient = new QueryClient();

init();
miniAppReady();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AlertContextProvider>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </AlertContextProvider>
        </BrowserRouter>
    </React.StrictMode>
);
