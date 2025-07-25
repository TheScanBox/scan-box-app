import { useAlert } from '@/context/AlertContext';
import { useSafeArea } from '@/context/SafeAreaContext';
import { NavLink } from 'react-router-dom';

const Tabs = () => {
    const { top } = useSafeArea();
    const { showAlert } = useAlert();

    return (
        <div
            className="flex justify-between items-center gap-1 overflow-x-auto no-scrollbar sticky z-50"
            style={{
                top: showAlert ? (top ? top + 45 : "4.5rem") : (top ? top : "1rem"),
            }}
        >
            <NavLink
                to="/profile"
                end
                className={({ isActive }) =>
                    `w-full text-center py-2 px-2 rounded-md transition-colors duration-75 ${isActive ? 'bg-black text-white' : 'hover:bg-black/60'
                    }`
                }
            >
                <span className="text-sm truncate">Mes Scans</span>
            </NavLink>

            <NavLink
                to="/profile/comments"
                className={({ isActive }) =>
                    `w-full text-center py-2 px-2 rounded-md transition-colors duration-75 ${isActive ? 'bg-black text-white' : 'hover:bg-black/60'
                    }`
                }
            >
                <span className="text-sm truncate">Mes Commentaires</span>
            </NavLink>

            <NavLink
                to="/profile/subscriptions"
                className={({ isActive }) =>
                    `w-full text-center py-2 px-2 rounded-md transition-colors duration-75 ${isActive ? 'bg-black text-white' : 'hover:bg-black/60'
                    }`
                }
            >
                <span className="text-sm truncate">Mes Abonnements</span>
            </NavLink>
        </div>
    );
};

export default Tabs;
