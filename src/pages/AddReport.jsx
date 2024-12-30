import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Modal from "react-modal";
import debounce from "lodash.debounce";
import LocationMap from '../components/LocationMap';
import axios from 'axios';
import ImageUploader from '../components/ImageUploader';

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

const Input = ({ label, handleChange, formData, name, type = "number" }) => (
    <div>
        <label htmlFor={name}>{label}</label>
        {
            type !== "textarea" ? <input type={type} name={name} id={name} value={formData[name]} onChange={handleChange} /> :
                <textarea name={name} id={name} value={formData[name]} onChange={handleChange} />
        }
    </div>
)

const YesOrNo = ({ label, handleChange, formData, name }) => {
    return (
        <div>
            <label htmlFor={name}>{label}? </label>
            <input type="radio" name={name} id={`${name}_yes`} value="Yes" checked={formData[name] === "Yes"} onChange={handleChange} />
            <label htmlFor={`${name}_yes`}>Yes</label>
            <input type="radio" name={name} id={`${name}_no`} value="No" checked={formData[name] === "No"} onChange={handleChange} />
            <label htmlFor={`${name}_no`}>No</label>
        </div>
    )
}

const BinaryInput = ({ label, handleChange, formData, name, val1, val2 }) => {
    return (
        <div>
            <label htmlFor={name}>{label} </label>
            <input type="radio" name={name} id={`${name}_${val1}`} value={val1} checked={formData[name] === val1} onChange={handleChange} />
            <label htmlFor={`${name}_${val1}`}>{val1}</label>
            <input type="radio" name={name} id={`${name}_${val2}`} value={val2} checked={formData[name] === val2} onChange={handleChange} />
            <label htmlFor={`${name}_${val2}`}>{val2}</label>
        </div>
    )
}

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
        faculty_total_present: 0,

        boys_hostels: 0,
        boys_hostels_capacity: 0,
        num_boys_avail: 0,
        girls_hostels: 0,
        girls_hostels_capacity: 0,
        num_girls_avail: 0,
        total_hostels: 0,
        total_hostels_capacity: 0,
        num_students_avail: 0,
        num_faculty_residence: 0,
        num_other_staffs_residence: 0,
        num_faculty_inside: 0,
        num_other_staffs_inside: 0,
        num_faculty_outside: 0,
        num_other_staffs_outside: 0,
        reason_faculty_outside: "",
        reason_other_staffs_outside: "",

        num_classes_expected: 0,
        num_classes_undertaken: 0,
        num_biometric_avail: 0,
        num_biometric_functional: 0,
        is_manual_attendance: "",
        is_app_based_attendance: "",

        is_dedicated_feeder_installed: "",
        feeder_hrs_avail: 0,
        is_power_backup_avail: "",
        power_backup_source: "",
        was_solar_backup_by_breda: "",

        num_classrooms_required: 0,
        num_classrooms_functional: 0,
        num_labs_required: 0,
        num_labs_functional: 0,
        num_students_enrolled: 0,
        are_equipments_used: "",
        reason_equipments_no_use: "",
        is_lang_lab_established: "",
        is_lang_lab_functional: "",
        num_lang_students_registered: 0,

        num_books_required: 0,
        num_books_avail: 0,
        num_journals_required: 0,
        num_journals_avail: 0,
        is_internet_installed: "",
        internet_speed: "",
        reason_no_internet: "",
        is_networking_installed: "",
        is_augmentation_undertaken: "",
        reason_no_networking: "",

        is_computer_procured: "",
        percent_computers_utilized: 0,
        reason_no_computer: "",
        is_equipment_procured: "",
        percent_equipment_utilized: 0,
        reason_no_equipment: "",
        is_library_functional: "",
        students_enrolled_in_library: 0,
        students_using_library: 0,
        is_ids_registered: "",
        was_ids_bank_acc_opened: "",
        is_ec_meeting_held_on_time: "",

        was_consultancy_work_started: "",
        num_projects_category1: 0,
        num_projects_category2: 0,
        num_projects_category3: 0,
        num_projects_category4: 0,
        consultancy_amount_earned: 0,
        consultancy_amount_distributed: 0,
        consultancy_amount_rest: 0,
        scope_for_consultancy: "",

        are_cell_meetings_ok: "",
        reason_cell_non_functioning: "",
        is_women_helpline_no_functional: "",
        reason_women_helpline_no_functional: "",
        is_water_supply_installed: "",
        reason_water_supply_not_installed: "",
        is_cctv_installed: "",
        reason_cctv_not_installed: "",
        num_nba_acc_files: 0,
        num_pahal_students: 0,
        num_pahal_classes: 0,

        is_disclosure_made_public: "",
        reason_disclosure_not_made_public: "",
        is_mess_functional: "Yes",
        mess_run_by: "",
        ac_dc_pending_amount: 0,
        ac_dc_settled_amount: 0,
        total_amount_with_college: 0,
        utilized_amount_as_on_date: 0,

        major_observations: "",
        recommendations: "",
        location: {
            coordinates: ["", ""],
            address: ""
        }
    });

    const getMaxByField = (array, field) => {
        if (array.length === 0) return null;
        return array.reduce((max, obj) => (obj[field] > max[field] ? obj : max));
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    let address = {};
                    // try {
                    //     address = (await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`)).data
                    // } catch (error) {
                    //     console.error(error)
                    // }
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            coordinates: [latitude, longitude],
                            address: Object.keys(address).length === 0 ? "" : getMaxByField(address.results, "confidence")?.formatted
                        }
                    }))
                },
                (err) => {
                    toast.error("Failed to retrieve location. Please allow location access.");
                    console.error(err);
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };

    const [page, setPage] = useState(1);

    useEffect(() => {
        const savedData = localStorage.getItem("formData");
        if (savedData) setFormData(JSON.parse(savedData));
        getLocation();
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
        return;
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
            <div>
                <button className={`px-2 py-1 cursor-pointer rounded-md ${page <= 1 ? 'bg-red-400' : 'bg-red-500'}`} disabled={page <= 1} onClick={() => setPage(prev => prev - 1)}>Prev</button>
                {
                    Array.from({ length: 11 }).map((_, index) => (
                        <span
                            key={index}
                            className={`cursor-pointer border p-1 ${page === index + 1 ? 'bg-gray-400' : ''}`}
                            onClick={() => setPage(index + 1)}
                        >
                            {index + 1}
                        </span>
                    ))
                }

                <button className={`px-2 py-1 cursor-pointer rounded-md ${page >= 11 ? 'bg-green-300' : 'bg-green-500'}`} disabled={page >= 11} onClick={() => setPage(prev => prev + 1)}>Next</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {
                    page === 1 &&
                    <>
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
                        <Input formData={formData} handleChange={handleChange} label="Institute Name" name="institute_name" type='text' />
                        <div className="flex flex-col mb-4">
                            <label htmlFor="start_date">Start Date</label>
                            <input type="date" name="start_date" id="start_date" onChange={handleChange} value={formData.start_date} />
                            <label htmlFor="end_date">End Date</label>
                            <input type="date" name="end_date" id="end_date" onChange={handleChange} value={formData.end_date} />
                        </div>
                        <Input formData={formData} handleChange={handleChange} label="Unique Code" name="unique_code" type='text' />
                        <Input formData={formData} handleChange={handleChange} label="Principal Name" name="principal_name" type='text' />
                        <Input formData={formData} handleChange={handleChange} label="Principal contact" name="principal_contact" type='text' />
                    </>
                }

                {
                    page === 2 &&
                    <>
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
                    </>
                }


                {/* Page 3 */}
                {
                    page === 3 &&
                    <>
                        <h2 className="font-bold mt-6">3. Hostels and number of students</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>No. of hostels</th>
                                    <th>Total Capacity</th>
                                    <th>No. of students available</th>
                                </tr>
                            </thead>
                            <tbody>
                                <InputRow formData={formData} label="Boys" names={["boys_hostels", "boys_hostels_capacity", "num_boys_avail"]} handleChange={handleChange} />
                                <InputRow formData={formData} label="Girls" names={["girls_hostels", "girls_hostels_capacity", "num_girls_avail"]} handleChange={handleChange} />
                                <InputRow formData={formData} label="Boys" names={["total_hostels", "total_hostels_capacity", "num_students_avail"]} handleChange={handleChange} />
                            </tbody>
                        </table>

                        <h2 className="font-bold mt-6">4. Residence of faculty and other staffs</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Faculty</th>
                                    <th>Other staffs</th>
                                </tr>
                            </thead>
                            <tbody>
                                <InputRow formData={formData} label="No. of residence" names={["num_faculty_residence", "num_other_staffs_residence"]} handleChange={handleChange} />
                                <InputRow formData={formData} label="No. of members residing inside" names={["num_faculty_inside", "num_other_staffs_inside"]} handleChange={handleChange} />
                                <InputRow formData={formData} label="No. of members residing outside" names={["num_faculty_outside", "num_other_staffs_outside"]} handleChange={handleChange} />
                            </tbody>
                        </table>
                        {
                            formData.num_faculty_outside > 0 &&
                            <Input formData={formData} handleChange={handleChange} label="Reason for faculty residing outside:" name="reason_faculty_outside" type='text' />
                        }
                        {
                            formData.num_other_staffs_outside > 0 &&
                            <Input formData={formData} handleChange={handleChange} label="Reason for other staffs residing outside:" name="reason_other_staffs_outside" type='text' />
                        }
                    </>
                }

                {/* Page 4 */}
                {
                    page === 4 &&
                    <>
                        <h2 className="font-bold mt-6">5. Classes Conducted</h2>
                        <Input formData={formData} handleChange={handleChange} label="Expected no. of classes" name="num_classes_expected" />
                        <Input formData={formData} handleChange={handleChange} label="No. of classes undertaken" name="num_classes_undertaken" />

                        <h2 className="font-bold mt-6">6. Face based biometric attendance (faculty & students)</h2>
                        <Input formData={formData} handleChange={handleChange} label="No. of devices available" name="num_biometric_avail" />
                        <Input formData={formData} handleChange={handleChange} label="No. of classes undertaken" name="num_biometric_functional" />

                        <h2 className="font-bold mt-6">7. Class wise attendance system</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Manually" name="is_manual_attendance" />
                        <YesOrNo formData={formData} handleChange={handleChange} label="App based" name="is_app_based_attendance" />
                    </>
                }


                {/* Page 5 */}
                {
                    page === 5 &&
                    <>
                        <h2 className="font-bold mt-6">8. Electricity or Dedicated Feeder</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Installation of dedicated feeder" name="is_dedicated_feeder_installed" />
                        {
                            formData.is_dedicated_feeder_installed === "Yes" &&
                            <>
                                <Input formData={formData} handleChange={handleChange} label="No. of hours of availability" name="feeder_hrs_avail" />
                                <YesOrNo formData={formData} handleChange={handleChange} label="Power backup available" name="is_power_backup_avail" />
                                {
                                    formData.is_power_backup_avail === "Yes" &&
                                    <BinaryInput formData={formData} handleChange={handleChange} label="Source of power backup" name="power_backup_source" val1="DG Set" val2="Solar" />
                                }
                                {
                                    formData.power_backup_source === "Solar" &&
                                    <YesOrNo formData={formData} handleChange={handleChange} label="Was Solar backup installed by BREDA" name="was_solar_backup_by_breda" />
                                }
                            </>
                        }

                        <h2 className="font-bold mt-6">9. Classroom</h2>
                        <Input formData={formData} handleChange={handleChange} label="No. of required classrooms" name="num_classrooms_required" />
                        <Input formData={formData} handleChange={handleChange} label="No. of functional classrooms" name="num_classrooms_functional" />

                        <h2 className="font-bold mt-6">10. Laboratory</h2>
                        <Input formData={formData} handleChange={handleChange} label="No. of required labs" name="num_labs_required" />
                        <Input formData={formData} handleChange={handleChange} label="No. of functional labs" name="num_labs_functional" />
                        <Input formData={formData} handleChange={handleChange} label="No. of students enrolled" name="num_students_enrolled" />
                        <YesOrNo formData={formData} handleChange={handleChange} label="Are the equipments being used" name="are_equipments_used" />
                        {
                            formData.are_equipments_used === "No" &&
                            <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_equipments_no_use" type='text' />
                        }

                        <h2 className="font-bold mt-6">11. Language Lab</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Established" name="is_lang_lab_established" />
                        {
                            formData.is_lang_lab_established === "Yes" &&
                            <YesOrNo formData={formData} handleChange={handleChange} label="Is it functional" name="is_lang_lab_functional" />
                        }
                        {
                            formData.is_lang_lab_functional === "Yes" &&
                            <Input formData={formData} handleChange={handleChange} label="No. of students registered" name="num_lang_students_registered" />
                        }
                    </>
                }

                {/* Page 6 */}
                {
                    page === 6 &&
                    <>
                        <h2 className="font-bold mt-6">12. No. of books, journals</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Required</th>
                                    <th>Available</th>
                                </tr>
                            </thead>
                            <tbody>
                                <InputRow formData={formData} label="Books" names={["num_books_required", "num_books_avail"]} handleChange={handleChange} />
                                <InputRow formData={formData} label="Journals" names={["num_journals_required", "num_journals_avail"]} handleChange={handleChange} />
                            </tbody>
                        </table>

                        <h2 className="font-bold mt-6">13. Internet / Wifi & Networking</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Internet / Wifi installed" name="is_internet_installed" />
                        {
                            formData.is_internet_installed === "Yes" ?
                                <Input formData={formData} handleChange={handleChange} label="Speed of Internet (Ex: 500Mbps)" name="internet_speed" type='text' /> :
                                formData.is_internet_installed === "No" &&
                                <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_internet" type='text' />
                        }
                        <YesOrNo formData={formData} handleChange={handleChange} label="Networking facility installed" name="is_networking_installed" />
                        {
                            formData.is_networking_installed === "Yes" ?
                                <YesOrNo formData={formData} handleChange={handleChange} label="Augmentation work undertaken" name="is_augmentation_undertaken" /> :
                                formData.is_networking_installed === "No" &&
                                <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_networking" type='text' />
                        }
                    </>
                }

                {/* Page 7 */}
                {
                    page === 7 &&
                    <>
                        <h2 className="font-bold mt-6">14. Procurement of Goods (if tender floated)</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Computer procured" name="is_computer_procured" />
                        {
                            formData.is_computer_procured === "Yes" ?
                                <Input formData={formData} handleChange={handleChange} label="% of computers utilized" name="percent_computers_utilized" /> :
                                formData.is_computer_procured === "No" &&
                                <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_computer" type='text' />
                        }
                        <YesOrNo formData={formData} handleChange={handleChange} label="Machine / Equipment procured" name="is_equipment_procured" />
                        {
                            formData.is_equipment_procured === "Yes" ?
                                <Input formData={formData} handleChange={handleChange} label="% of equipment utilized" name="percent_equipment_utilized" /> :
                                formData.is_equipment_procured === "No" &&
                                <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_equipment" type='text' />
                        }

                        <h2 className="font-bold mt-6">15. Library</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Is Library functional" name="is_library_functional" />
                        <Input formData={formData} handleChange={handleChange} label="No. of students enrolled" name="students_enrolled_in_library" />
                        {
                            formData.is_library_functional === "Yes" &&
                            <Input formData={formData} handleChange={handleChange} label="Avg no. of students using it (as per the register or records)" name="students_using_library" />
                        }

                        <h2 className="font-bold mt-6">16. Institute Development Society (IDS)</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Registered" name="is_ids_registered" />
                        {
                            formData.is_ids_registered === "Yes" &&
                            <YesOrNo formData={formData} handleChange={handleChange} label="Bank account opened" name="was_ids_bank_acc_opened" />
                        }
                        {
                            formData.was_ids_bank_acc_opened === "Yes" &&
                            <Input formData={formData} handleChange={handleChange} label="EC meeting held on time" name="is_ec_meeting_held_on_time" />
                        }
                    </>
                }


                {/* Page 8 */}
                {
                    page === 8 &&
                    <>
                        <h2 className="font-bold mt-6">17. Consultancy work</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="College started Consultancy work" name="was_consultancy_work_started" />
                        {
                            formData.was_consultancy_work_started === "Yes" ?
                                <>
                                    <h3>No. of projects in:</h3>
                                    <Input formData={formData} handleChange={handleChange} label="Category 1" name="num_projects_category1" />
                                    <Input formData={formData} handleChange={handleChange} label="Category 2" name="num_projects_category2" />
                                    <Input formData={formData} handleChange={handleChange} label="Category 3" name="num_projects_category3" />
                                    <Input formData={formData} handleChange={handleChange} label="Category 4" name="num_projects_category4" />

                                    <h3>Financial status:</h3>
                                    <Input formData={formData} handleChange={handleChange} label="Total amount earned" name="consultancy_amount_earned" />
                                    <Input formData={formData} handleChange={handleChange} label="Total amount distributed" name="consultancy_amount_distributed" />
                                    <Input formData={formData} handleChange={handleChange} label="Rest amount in the bank account" name="consultancy_amount_rest" />
                                </> :
                                formData.was_consultancy_work_started === "No" &&
                                <Input formData={formData} handleChange={handleChange} label="Assess the scope for consultancy" name="scope_for_consultancy" type='text' />
                        }

                        <h2 className="font-bold mt-6">18. Constitution of cell / committee</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Meetings taking place as planned" name="are_cell_meetings_ok" />
                        {
                            formData.are_cell_meetings_ok === "No" &&
                            <Input formData={formData} handleChange={handleChange} label="Reason for non functioning (committee wise report)" name="reason_cell_non_functioning" type='textarea' />
                        }
                    </>
                }


                {/* Page 9 */}
                {
                    page === 9 &&
                    <>
                        <h2 className="font-bold mt-6">19. Security and other amenities</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Women helpline number functional" name="is_women_helpline_no_functional" />
                        {
                            formData.is_women_helpline_no_functional === "No" &&
                            <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_women_helpline_no_functional" type='text' />
                        }

                        <YesOrNo formData={formData} handleChange={handleChange} label="Portable water supply and outlets for drinking water installed at strategic locations" name="is_water_supply_installed" />
                        {
                            formData.is_water_supply_installed === "No" &&
                            <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_water_supply_not_installed" type='text' />
                        }

                        <YesOrNo formData={formData} handleChange={handleChange} label="CCTV cameras installed at vital points" name="is_cctv_installed" />
                        {
                            formData.is_cctv_installed === "No" &&
                            <Input formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_cctv_not_installed" type='text' />
                        }

                        <h2 className="font-bold mt-6">20. NBA accreditation</h2>
                        <Input formData={formData} handleChange={handleChange} label="No. of files prepared" name="num_nba_acc_files" />

                        <h2 className="font-bold mt-6">21. Pahal</h2>
                        <Input formData={formData} handleChange={handleChange} label="No. of Students" name="num_pahal_students" />
                        <Input formData={formData} handleChange={handleChange} label="Total classes per day" name="num_pahal_classes" />
                    </>
                }


                {/* Page 10 */}
                {
                    page === 10 &&
                    <>
                        <h2 className="font-bold mt-6">22. Mandatory Disclosure</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Mandatory disclosure made publicly availabale" name="is_disclosure_made_public" />
                        {
                            formData.is_disclosure_made_public === "No" &&
                            <Input formData={formData} handleChange={handleChange} label="Mention the reason" name="reason_disclosure_not_made_public" type='text' />
                        }

                        <h2 className="font-bold mt-6">23. Mess / Canteen</h2>
                        <YesOrNo formData={formData} handleChange={handleChange} label="Functional" name="is_mess_functional" />
                        {
                            formData.is_mess_functional === "Yes" &&
                            <BinaryInput formData={formData} handleChange={handleChange} label="Who runs it?" name="mess_run_by" val1="College" val2="Students" />
                        }


                        <h2 className="font-bold mt-6">24. Financial Status (amount)</h2>
                        <Input formData={formData} handleChange={handleChange} label="Pending AC/DC bill amount" name="ac_dc_pending_amount" />
                        <Input formData={formData} handleChange={handleChange} label="Settled AC/DC bill amount" name="ac_dc_settled_amount" />
                        <Input formData={formData} handleChange={handleChange} label="Total amount with the college" name="total_amount_with_college" />
                        <Input formData={formData} handleChange={handleChange} label="Utilized amount as on date" name="utilized_amount_as_on_date" />
                    </>
                }


                {/* Page 11 */}
                {
                    page === 11 &&
                    <>
                        <Input formData={formData} handleChange={handleChange} label="Major Observations / Findings" name="major_observations" type='textarea' />
                        <Input formData={formData} handleChange={handleChange} label="Recommendations for improvement or action" name="recommendations" type='textarea' />
                        <div>
                            <span>Location: </span>
                            <span> {formData.location.address} </span>
                            <button className='border' onClick={getLocation}>Update</button>
                        </div>
                        {/* <iframe src="https://www.openstreetmap.org/?mlat=25.27423&mlon=82.98374#map=17/25.27423/82.98374" frameborder="0"></iframe> */}
                        <LocationMap position={formData.location.coordinates} />
                        <ImageUploader />

                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
                    </>
                }
            </form>
        </div>
    );
};

export default AddReport;
