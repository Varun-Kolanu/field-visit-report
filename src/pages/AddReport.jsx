import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from "react-modal";
import debounce from "lodash.debounce";

const AddReport = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

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
        principal_contact: ""


    });

    useEffect(() => {
        const savedData = localStorage.getItem("formData");
        if (savedData && Object.keys(savedData).length > 0) setFormData(JSON.parse(savedData));
    }, [])

    const saveToLocalStorage = (data) => {
        localStorage.setItem("formData", JSON.stringify(data));
    };

    const useDebouncedSave = (callback, delay) => {
        return useCallback(debounce(callback, delay), [callback, delay]);
    };

    const debouncedSave = useDebouncedSave(saveToLocalStorage, 2000);

    useEffect(() => {
        debouncedSave(formData);
    }, [formData, debouncedSave]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        return;
        try {
            const response = await fetch('http://localhost:5000/api/v1/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data) {
                toast.success("Review Posted successfully");
            } else {
                alert('Failed to submit report: ' + data.message);
            }
        } catch (error) {
            alert('Error submitting report: ' + error.message);
        }
    };

    const addOfficer = () => {
        if (officerName.length === 0 || officerDesignation.length === 0) {
            toast.error("Please fill all fields");
            return;
        }

        const newOfficers = [
            ...formData.officers,
            { name: officerName, designation: officerDesignation }
        ]

        setFormData(prev => ({
            ...prev,
            officers: newOfficers
        }))
        setOfficerName("");
        setOfficerDesignation("");
        closeModal();
    }

    const deleteOfficer = (index) => {
        const newOfficers = formData.officers.filter((_, ind) => ind != index);
        setFormData(prev => ({
            ...prev,
            officers: newOfficers
        }))
    }

    Modal.setAppElement("#root");

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-black">
            <h1 className="text-2xl font-bold mb-4">Field Visit Report</h1>
            <div>
                <span>College Type:</span>
                <select name="type" id="type" onChange={handleChange} value={formData.type}>
                    <option value="poly">Polytechnic</option>
                    <option value="engg">Engineering</option>
                </select>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Page 1 */}
                <div>
                    <div>
                        <span>Officers: </span>
                        <button onClick={openModal}>Add</button>
                        <div>
                            {
                                formData.officers.map((officer, index) => (
                                    <div key={index}>
                                        <span>{officer.name}</span>
                                        <span>{officer.designation}</span>
                                        <button onClick={() => deleteOfficer(index)}>Delete</button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                        <div className='px-3'>
                            <h2>Add Officer</h2>
                            <div className='flex flex-col gap-4'>
                                <div>
                                    <label htmlFor="officer_name">Name</label>
                                    <input type="text" id='officer_name' className='border' onChange={e => setOfficerName(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="officer_designation">Designation</label>
                                    <input type="text" id='officer_designation' className='border' onChange={e => setOfficerDesignation(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={addOfficer}>Add</button>
                            <button onClick={closeModal}>Close</button>
                        </div>
                    </Modal>

                    <div className='flex flex-col'>
                        <label htmlFor="institute_name">Institute Name</label>
                        <input type="text" id='institute_name' name='institute_name' onChange={handleChange} value={formData.institute_name} />
                    </div>

                    <div>
                        <label htmlFor="start_date">Date of Visit</label>
                        <div className='flex'>
                            <div className='flex flex-col'>
                                <label htmlFor="start_date">Start Date</label>
                                <input type="date" name='start_date' id='start_date' onChange={handleChange} value={formData.start_date} />
                            </div>
                            <div className='flex flex-col'>
                                <label htmlFor="end_date">End Date</label>
                                <input type="date" name='end_date' id='end_date' onChange={handleChange} value={formData.end_date} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="unique_code">Unique Code assigned by AICTE</label>
                        <input type="text" name="unique_code" id="unique_code" value={formData.unique_code} onChange={handleChange} />
                    </div>

                    <div className='flex flex-col'>
                        <label htmlFor="principal_name">Principal's name</label>
                        <input type="text" name='principal_name' id='principal_name' value={formData.principal_name} onChange={handleChange} />
                    </div>

                    <div>
                        <label htmlFor="principal_contact">Principal's contact number</label>
                        <input type="text" name='principal_contact' id='principal_contact' value={formData.principal_contact} onChange={handleChange} />
                    </div>


                    {/* Page 2 */}
                    {/* <h2>1. Intake capacity and presence of students</h2> */}

                </div>
            </form>
        </div>
    );
};

export default AddReport;
