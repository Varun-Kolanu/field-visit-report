import { memo, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Logout from "../components/Logout";
import { useUser } from "../context/context";

const Layout = memo(() => {
    const { user } = useUser();
    const location = useLocation();
    const { pathname } = location;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <main className="relative min-h-screen">
            <button
                className="fixed top-4 left-4 z-30 p-2 bg-gray-800 text-white rounded-md focus:outline-none"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? "✕" : "☰"}
            </button>

            <aside
                className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform transition-transform duration-300 z-20 ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"
                    }`}
            >
                <div className="h-20">
                </div>
                <nav className="flex flex-col gap-2 p-4">
                    {user?.role === "admin" && pathname !== "/all_reports" && (
                        <button
                            className="w-full p-2 bg-blue-500 rounded-md text-left hover:bg-blue-600"
                            onClick={() => (window.location.href = "/all_reports")}
                        >
                            All Reports
                        </button>
                    )}
                    {pathname !== "/my_reports" && (
                        <button
                            className="w-full p-2 bg-green-500 rounded-md text-left hover:bg-green-600"
                            onClick={() => (window.location.href = "/my_reports")}
                        >
                            My Reports
                        </button>
                    )}

                    <button
                        className="w-full p-2 bg-gray-500 rounded-md text-left hover:bg-gray-600"
                        onClick={() => (window.location.href = "/")}
                    >
                        Add Report
                    </button>

                    {
                        user?.role === "admin" &&
                        <button
                            className="w-full p-2 bg-red-500 rounded-md text-left hover:bg-gray-600"
                            onClick={() => (window.location.href = "/admin")}
                        >
                            Admin Panel
                        </button>
                    }
                </nav>
            </aside>

            <div
                className={`transition-transform duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"
                    }`}
            >
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    <Logout />
                    <Outlet />
                </div>
            </div>
        </main>
    );
});

export default Layout;
