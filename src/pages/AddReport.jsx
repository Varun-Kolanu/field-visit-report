import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Modal from "react-modal";
import debounce from "lodash.debounce";

const OfficerRow = ({ officer, index, onDelete }) => (
    <div className="flex justify-between items-center mb-2">
        <span>{officer.name}</span>
        <span>{officer.designation}</span>
        <button onClick={(e) => { e.preventDefault(); onDelete(index); }} className="text-red-500">Delete</button>
    </div>
);

const InputRow = ({ label, names, handleChange, formData }) => (
    <tr>
        <td>{label}</td>
        {
            names.map((name) => (
                <td key={name}><input type="number" name={name} value={formData[name]} onChange={handleChange} /></td>
            ))
        }
    </tr>
);

const AddReport = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [officerName, setOfficerName] = useState("");
    const [officerDesignation, setOfficerDesignation] = useState("");
    const [formData, setFormData] = useState({
        type: "poly",
        officers: [],
        institute_name: "",
        start_date: "",
        end_date: "",
        unique_code: "",
        principal_name: "",
        principal_contact: "",

        year1_admission: 0,
        year1_present: 0,
        year2_admission: 0,
        year2_present: 0,
        year3_admission: 0,
        year3_present: 0,
        year4_admission: 0,
        year4_present: 0,
        mtech_1_admission: 0,
        mtech_1_present: 0,
        mtech_2_admission: 0,
        mtech_2_present: 0,
        faculty_fulltime_posted: 0,
        faculty_fulltime_present: 0,
        faculty_contractual_posted: 0,
        faculty_contractual_present: 0,
        faculty_guest_posted: 0,
        faculty_guest_present: 0,
        faculty_total_posted: 0,
        faculty_total_present: 0
    });

    useEffect(() => {
        const savedData = localStorage.getItem("formData");
        if (savedData) setFormData(JSON.parse(savedData));
    }, []);

    const debouncedSave = useCallback(debounce((data) => {
        localStorage.setItem("formData", JSON.stringify(data));
    }, 2000), []);

    useEffect(() => {
        debouncedSave(formData);
    }, [formData, debouncedSave]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/v1/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) toast.success("Report submitted successfully");
            else toast.error(`Failed to submit report: ${data.message}`);
        } catch (error) {
            toast.error(`Error submitting report: ${error.message}`);
        }
    };

    const addOfficer = () => {
        if (!officerName || !officerDesignation) {
            toast.error("Please fill all fields");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            officers: [...prev.officers, { name: officerName, designation: officerDesignation }],
        }));
        setOfficerName("");
        setOfficerDesignation("");
        setIsOpen(false);
    };

    const deleteOfficer = (index) => {
        setFormData((prev) => ({
            ...prev,
            officers: prev.officers.filter((_, ind) => ind !== index),
        }));
    };

    Modal.setAppElement("#root");

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-black">
            <h1 className="text-2xl font-bold mb-4">Field Visit Report</h1>
            <div className="mb-4">
                <span>College Type:</span>
                <select name="type" onChange={handleChange} value={formData.type}>
                    <option value="poly">Polytechnic</option>
                    <option value="engg">Engineering</option>
                </select>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h2 className="font-bold mb-2">Officers</h2>
                    <button onClick={(e) => { e.preventDefault(); setIsOpen(true); }} className="mb-4">Add Officer</button>
                    <div>
                        {formData.officers.map((officer, index) => (
                            <OfficerRow key={index} officer={officer} index={index} onDelete={deleteOfficer} />
                        ))}
                    </div>
                </div>
                <Modal isOpen={modalIsOpen} onRequestClose={() => setIsOpen(false)}>
                    <div className="px-3">
                        <h2>Add Officer</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="officer_name">Name</label>
                                <input type="text" id="officer_name" className="border" value={officerName} onChange={(e) => setOfficerName(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="officer_designation">Designation</label>
                                <input type="text" id="officer_designation" className="border" value={officerDesignation} onChange={(e) => setOfficerDesignation(e.target.value)} />
                            </div>
                        </div>
                        <button onClick={addOfficer}>Add</button>
                        <button onClick={() => setIsOpen(false)}>Close</button>
                    </div>
                </Modal>
                <div className="flex flex-col mb-4">
                    <label htmlFor="institute_name">Institute Name</label>
                    <input type="text" id="institute_name" name="institute_name" onChange={handleChange} value={formData.institute_name} />
                </div>
                <div className="flex flex-col mb-4">
                    <label htmlFor="start_date">Start Date</label>
                    <input type="date" name="start_date" id="start_date" onChange={handleChange} value={formData.start_date} />
                    <label htmlFor="end_date">End Date</label>
                    <input type="date" name="end_date" id="end_date" onChange={handleChange} value={formData.end_date} />
                </div>
                <div>
                    <label htmlFor="unique_code">Unique Code</label>
                    <input type="text" name="unique_code" id="unique_code" value={formData.unique_code} onChange={handleChange} />
                </div>
                <h2 className="font-bold mt-6">1. Intake Capacity and Presence of Students</h2>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Admission</th>
                            <th>Present</th>
                        </tr>
                    </thead>
                    <tbody>
                        <InputRow formData={formData} label="1st Year" names={["year1_admission", "year1_present"]} handleChange={handleChange} />
                        <InputRow formData={formData} label="2nd Year" names={["year2_admission", "year2_present"]} handleChange={handleChange} />
                        <InputRow formData={formData} label="3rd Year" names={["year3_admission", "year3_present"]} handleChange={handleChange} />
                        {formData.type === "engg" && (
                            <>
                                <InputRow formData={formData} label="4th Year" names={["year4_admission", "year4_present"]} handleChange={handleChange} />
                                <InputRow formData={formData} label="MTech 1st Yr" names={["mtech_1_admission", "mtech_1_present"]} handleChange={handleChange} />
                                <InputRow formData={formData} label="MTech 2nd Yr" names={["mtech_2_admission", "mtech_2_present"]} handleChange={handleChange} />
                            </>
                        )}
                    </tbody>
                </table>

                <h2 className="font-bold mt-6">2. Count and presence of the qualified faculty</h2>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Posted</th>
                            <th>Present</th>
                        </tr>
                    </thead>
                    <tbody>
                        <InputRow formData={formData} label="Full Time" names={["faculty_fulltime_posted", "faculty_fulltime_present"]} handleChange={handleChange} />
                        <InputRow formData={formData} label="Contractual" names={["faculty_contractual_posted", "faculty_contractual_present"]} handleChange={handleChange} />
                        <InputRow formData={formData} label="Guest" names={["faculty_guest_posted", "faculty_guest_present"]} handleChange={handleChange} />
                        <InputRow formData={formData} label="Total" names={["faculty_total_posted", "faculty_total_present"]} handleChange={handleChange} />
                    </tbody>
                </table>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
            </form>
        </div>
    );
};

export default AddReport;
