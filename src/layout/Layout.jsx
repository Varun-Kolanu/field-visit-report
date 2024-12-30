import { memo, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Logout from "../components/Logout";
import { useUser } from "../context/context";


const Layout = memo(({ }) => {
    const { user } = useUser();
    const location = useLocation();
    const { pathname } = location;
    useEffect(() => {
    }, [pathname]);


    return (
        <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                {
                    user.role === "admin" &&

                    <button className='rounded-md bg-blue-500 p-2 text-white fixed top-2 right-24 z-10' onClick={() => window.location.href = "/all_reports"}>All Reports</button>

                }
                <Logout />
                <Outlet />
            </div>
        </main>
    );
    ;
});

export default Layout;