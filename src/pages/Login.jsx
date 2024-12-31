import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate()

    const oauthLoginHandler = () => {
        window.location.href = import.meta.env.VITE_BACKEND_URL + "/api/v1/auth/google";
    }

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/")
        }
    }, [location, navigate])

    return (
        <>
            {
                <div className='flex flex-col justify-around items-center h-[100vh] bg-gray-700'>
                    <div className='w-96 bg-[#f4f1f4] py-2 rounded-2xl flex flex-col justify-evenly items-center'>
                        <h1 className='text-center font-bold text-3xl text-gray-700'>Login</h1>
                        <div className='p-5 flex justify-center'>
                            <img src="/bihar-govt.webp" alt="Bihar Government" className="w-32 h-32 object-contain" />
                        </div>
                        <p className='py-3 text-lg text-center'>
                            Department of Science, Technology and Technical Education
                        </p>

                        <div className='flex w-40'>
                            <button type="button" onClick={oauthLoginHandler} className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-white p-4 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50 transition-all">
                                <span>
                                    <img src="/google.svg" alt="G" />
                                </span>
                                Google
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default Login;
