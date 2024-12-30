import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const BackendRedirection = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token")
        const error = urlParams.get("error")
        if (token) {
            localStorage.setItem("token", token)
            return navigate("/")
        } else if (error) {
            console.error(error)
            return navigate(`/login`)
        }
    }, [])
    return (
        <div></div>
    )
}

export default BackendRedirection