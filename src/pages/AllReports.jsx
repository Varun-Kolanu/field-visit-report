import React, { useEffect, useState } from 'react'
import axios from '../utils/axiosInstance'
import { useUser } from '../context/context'
import { getDate } from '../utils/utils'

const AllReports = () => {
    const [reports, setReports] = useState([])
    const [type, setType] = useState('poly')
    const { user } = useUser();

    useEffect(() => {
        if (user === null) return;
        console.log(user)
        if (user && user?.role !== "admin") {
            window.location.href = "/";
            return;
        }
        async function fetchReports() {
            const response = await axios.get("/reports", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            })
            setReports(response.data)
        }
        fetchReports();
    }, [user])
    return (
        <>
            <h1>All Reports</h1>
            <label htmlFor="type_of_report">College Type: </label>
            <select name="type" id="type_of_report" onChange={e => setType(e.target.value)}>
                <option value="poly">Polytechnic</option>
                <option value="engg">Engineering</option>
            </select>
            {
                reports.length === 0 ? <div>No Reports</div> :
                    <div className='grid md:grid-cols-3 grid-cols-1'>
                        {
                            reports.filter(report => report.type === type).map(report => (
                                <div key={report._id} className='border p-3'>
                                    <div>College: {report.institute_name}</div>
                                    <div>Officers: {report.officers}</div>
                                    <div>{getDate(report.start_date)} - {getDate(report.end_date)}</div>
                                    <div>By {report.user_name}</div>
                                    <a href={`/?id=${report._id}`} className='px-2 py-1 rounded-md bg-blue-500 text-white'>See Report</a>
                                </div>
                            ))
                        }
                    </div>
            }
        </>
    )
}

export default AllReports