import React from 'react'

const Logout = () => {
    const logoutHandler = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return (
        <button className='z-10 rounded-md bg-red-500 p-2 text-white fixed top-2 right-4' onClick={logoutHandler}>Logout</button>
    )
}

export default Logout