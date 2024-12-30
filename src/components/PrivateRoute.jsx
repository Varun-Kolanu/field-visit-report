import React, { useEffect, useState } from 'react';
import { useUser } from '../context/context.jsx';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader.jsx';

const PrivateRoute = ({ children }) => {
    const { user } = useUser();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setIsAuthenticated(!!user._id);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated === false) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated === null) {
        return <Loader />;
    }

    return (
        <>
            {isAuthenticated && children}
        </>
    );
};

export default PrivateRoute;
