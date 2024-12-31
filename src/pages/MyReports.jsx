import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { getDate } from '../utils/utils';

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [type, setType] = useState('poly');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchReports() {
            const response = await axios.get("/reports/my", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setReports(response.data);
        }
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const matchesType = report.type === type;
        const matchesSearchQuery = report.institute_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.officers.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearchQuery;
    });

    return (
        <div className="max-w-screen-lg mx-auto p-4 mt-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">My Reports</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by College or Officers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full md:w-1/3"
                />
            </div>

            <div className="flex items-center mb-4">
                <label htmlFor="type_of_report" className="mr-2 text-lg text-gray-600">College Type: </label>
                <select
                    name="type"
                    id="type_of_report"
                    onChange={e => setType(e.target.value)}
                    className="border border-gray-300 rounded-md p-2"
                >
                    <option value="poly">Polytechnic</option>
                    <option value="engg">Engineering</option>
                </select>
            </div>

            {filteredReports.length === 0 ? (
                <div className="text-center text-gray-600">No Reports</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredReports.map(report => (
                        <div key={report._id} className="border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <div className="font-semibold text-gray-800">College: {report.institute_name}</div>
                            <div className="text-gray-600 mt-2"><span className='font-bold'>Officers</span>: {report.officers}</div>
                            <div className="text-gray-600 mt-2">{getDate(report.start_date)} - {getDate(report.end_date)}</div>
                            <a
                                href={`/?id=${report._id}`}
                                className="mt-4 inline-block px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            >
                                See Report
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReports;
