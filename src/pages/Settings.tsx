import { Page } from "@/components/Page"
import { useAlert } from "@/context/AlertContext";
import { useSafeArea } from "@/context/SafeAreaContext";

const Settings = () => {
    const { top, bottom } = useSafeArea();
    const { showAlert } = useAlert();

    return (
        <Page>
            <div
                className="flex flex-col gap-4 py-3 md:max-w-[700px] mx-auto text-white"
                style={{
                    marginTop: showAlert ? 0 : top,
                    marginBottom: bottom
                }}
            >
                <div className="px-3">
                    <h1 className="text-2xl font-bold">Paramètres</h1>
                    <p className="text-xs text-slate-400">Controlez vos préférences et paramètres ici.</p>
                </div>

                <div className="px-3">
                    <p className="text-sm text-slate-100">Aucun paramètre disponible pour le moment.</p>
                </div>

                <div className="hidden">
                    <div className="px-3">
                        <h2 className="text-sm font-bold">Bio</h2>
                        <textarea
                            className="w-full bg-slate-700 text-white p-2 mt-1 rounded-md text-xs border border-slate-700 focus:border-slate-500 outline-none resize-none"
                            placeholder="Aucune bio pour le moment."
                            rows={4}
                        // disabled
                        />
                    </div>

                    <p className="px-3 py-2 text-[0.6rem] bg-slate-900/60 hidden">Votre bio est visible sur votre profil public.</p>
                </div>

                <div className="px-3 hidden">
                    <button
                        className="w-full bg-blue-600 text-white p-2 rounded-md text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        onClick={() => alert("Bientôt disponible !")}
                    >
                        Enregistre les modifications
                    </button>
                </div>
            </div>
        </Page>
    )
}

export default Settings