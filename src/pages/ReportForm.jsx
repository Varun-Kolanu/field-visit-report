import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Modal from "react-modal";
import debounce from "lodash.debounce";
import LocationMap from '../components/LocationMap';
import ImageUploader from '../components/ImageUploader';
import axios from '../utils/axiosInstance';
import Loader from '../components/Loader';
import { Page, Text, View, Document, PDFDownloadLink, Image, pdf } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";


const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 12,
    padding: 10,
    border: "1px solid #000",
    borderRadius: 4,
  },
  image: {
    marginBottom: 20,
    height: 100,
    width: 100, 
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
  },
  stamp: {
    fontSize: 10,
    textAlign: "left",
  },
  signature: {
    fontSize: 10,
    textAlign: "right",
  },
});

const MyPDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{data.title}</Text>

      {data.fields.map((field, index) => (
        <View key={index} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}:</Text>
          <Text style={styles.fieldValue}>{field.value}</Text>
        </View>
      ))}

        {data.image &&
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Uploaded Image</Text>
            <Image src={data.image} style={styles.image} />
        </View>
        }

      <View style={styles.footer}>
        <Text style={styles.stamp}>{data.stampText}</Text>
        <Text style={styles.signature}>{data.signatureText}</Text>
      </View>
    </Page>
  </Document>
);

const OfficerRow = ({ officer, index, onDelete, edit }) => (
    <div className="flex justify-between items-center mb-4 bg-gray-100 rounded-lg p-3 shadow-md">
        <span className="text-lg font-semibold">{officer.name}</span>
        <span className="text-gray-600">{officer.designation}</span>
        {edit && (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onDelete(index);
                }}
                className="text-red-600 font-medium hover:underline"
            >
                Delete
            </button>
        )}
    </div>
);

const InputRow = ({ label, names, handleChange, formData, edit }) => (
    <tr className="bg-gray-50 border-b">
        <td className="p-3 font-medium">{label}</td>
        {names.map((name) => (
            <td key={name} className="p-3">
                <input
                    disabled={!edit}
                    type="number"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full rounded-lg p-2 border ${edit ? "border-gray-300" : "border-transparent bg-gray-100"
                        }`}
                />
            </td>
        ))}
    </tr>
);

const Input = ({ label, handleChange, formData, name, type = "number", edit }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-gray-700 font-medium mb-2">
            {label}
        </label>
        {type !== "textarea" ? (
            <input
                disabled={!edit}
                type={type}
                name={name}
                id={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full rounded-lg p-2 border ${edit ? "border-gray-300" : "border-transparent bg-gray-100"
                    }`}
            />
        ) : (
            <textarea
                disabled={!edit}
                name={name}
                id={name}
                value={formData[name]}
                onChange={handleChange}
                className={`w-full rounded-lg p-2 border h-24 ${edit ? "border-gray-300" : "border-transparent bg-gray-100"
                    }`}
            />
        )}
    </div>
);

const YesOrNo = ({ label, handleChange, formData, name, edit }) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">{label}?</label>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name={name}
                        id={`${name}_yes`}
                        value="Yes"
                        checked={formData[name] === "Yes"}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-5 h-5"
                    />
                    Yes
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name={name}
                        id={`${name}_no`}
                        value="No"
                        checked={formData[name] === "No"}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-5 h-5"
                    />
                    No
                </label>
            </div>
        </div>
    );
};

const BinaryInput = ({ label, handleChange, formData, name, val1, val2, edit }) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">{label}</label>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name={name}
                        id={`${name}_${val1}`}
                        value={val1}
                        checked={formData[name] === val1}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-5 h-5"
                    />
                    {val1}
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name={name}
                        id={`${name}_${val2}`}
                        value={val2}
                        checked={formData[name] === val2}
                        onChange={handleChange}
                        disabled={!edit}
                        className="w-5 h-5"
                    />
                    {val2}
                </label>
            </div>
        </div>
    );
};

const ReportForm = () => {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [officerName, setOfficerName] = useState("");
    const [officerDesignation, setOfficerDesignation] = useState("");
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id")
    const [edit, setEdit] = useState(id === undefined || id === null);
    const [loading, setLoading] = useState(false);

    const emptyForm = {
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
        },
        image_url: ""
    }
    const [formData, setFormData] = useState(emptyForm);

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadToFirebase = async (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await axios.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        })

        return response.data
    };

    const [pdfData, setPdfData] = useState({
        title: "Field Visit Report",
        fields: [],
        image: "",
        stampText: "Official Seal",
        signatureText: "Principal's Signature",
    });

    useEffect(() => {
        const fetchImage = async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch image");
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.error("Image fetch error:", error);
            return null;
          }
        };
    
        const preparePdfData = async () => {
            let imageBase64 = ""
            if (formData.image_url) {
                imageBase64 = await fetchImage(formData.image_url)
            }
    
          const fields = [
            { label: "College Type", value: formData.type === "engg" ? "Engineering" : formData.type === "poly" ? "Polytechnic" : "" },
            { label: "Officers", value: formData.officers.map((officer) => `${officer.name} (${officer.designation})`).join(", ") },
            { label: "Institute Name", value: formData.institute_name },
            { label: "Principal Name", value: formData.principal_name },
            { label: "Principal Contact", value: formData.principal_contact },
            { label: "Major Observations / Findings", value: formData.major_observations },
            { label: "Recommendations for improvement or action", value: formData.recommendations },
            { label: "Location", value: formData.location.address },
          ];
    
          setPdfData(prev => ({
            ...prev,
            fields,
            image: imageBase64,
          }));
        };
    
        preparePdfData();
      }, [formData]);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    let address = "";
                    try {
                        address = (await axios.get(`/address?latitude=${latitude}&longitude=${longitude}`)).data
                    } catch (error) {
                        console.error(error)
                    }
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            coordinates: [latitude, longitude],
                            address
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
        async function getReport() {
            const response = await axios.get(`/reports/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            setFormData(response.data);
        }
        if (id === undefined || id === null) {
            const savedData = localStorage.getItem("formData");
            if (savedData && Object.keys(savedData).length > 0) setFormData(JSON.parse(savedData));
        } else {
            getReport();
        }
    }, []);

    useEffect(() => {
        if (page === 11 && (id === undefined || id === null)) {
            getLocation();
        }
    }, [page])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                if (page > 1) setPage(prev => prev - 1);
                event.preventDefault();  // Prevent default behavior (like scrolling)
            } else if (event.key === 'ArrowRight') {
                if (page < 11) setPage(prev => prev + 1);
                event.preventDefault();  // Prevent default behavior (like scrolling)
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [page]);



    const debouncedSave = useCallback(debounce((data) => {
        localStorage.setItem("formData", JSON.stringify(data));
    }, 2000), []);

    useEffect(() => {
        if (id === undefined || id === null) debouncedSave(formData);
    }, [formData, debouncedSave]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (page !== 11) return;
        let newFormData = formData;
        setLoading(true);
        if (image) {
            const image_url = await uploadToFirebase(image);
            newFormData = {
                ...formData,
                image_url,
            }
        }
        if (id === undefined || id === null) {
            if (formData.officers.length === 0) {
                setLoading(false)
                return toast.error("Please add atlease one officer")
            }
            try {
                await axios.post('/reports', newFormData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            } catch (error) {
                setLoading(false);
                return;
            }
            setLoading(false)
            toast.success("Report submitted successfully");
            setFormData(emptyForm);
            localStorage.setItem("formData", JSON.stringify(emptyForm))
            window.location.href = "/my_reports";
        } else {
            try {
                await axios.put(`/reports/${id}`, newFormData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            } catch (error) {
                setLoading(false);
                return;
            }
            setLoading(false)
            toast.success("Report updated successfully");
            setEdit(false);
            window.location.reload()
        }
        setLoading(false);
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

    if (loading) return <Loader />

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-black">
            <h1 className="text-2xl font-bold mb-4"> {(id === null || id === undefined) && 'Add'} Field Visit Report</h1>
            {
                id !== undefined && id !== null &&
                <button className={` ${edit ? 'bg-gray-500' : 'bg-yellow-500'} rounded-md px-4 py-2 mb-4 md:mb-0 mr-4`} onClick={() => {
                    setEdit(prev => !prev);
                }}>
                    {
                        edit ? "Cancel" : "Edit Form"
                    }
                </button>
            }
            <PDFDownloadLink
                document={<MyPDFDocument data={pdfData} />}
                fileName={`field-visit-report-${formData.institute_name}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
            </PDFDownloadLink>

            <div className="flex items-center justify-center space-x-2 md:space-x-4 mt-4">
                <button
                    className={`px-2 py-1 cursor-pointer rounded-md ${page <= 1 ? 'bg-red-400' : 'bg-red-500'} disabled:bg-gray-300`}
                    disabled={page <= 1}
                    onClick={() => setPage(prev => prev - 1)}
                >
                    Prev
                </button>

                <div className="flex flex-wrap space-x-1">
                    {
                        Array.from({ length: 11 }).map((_, index) => (
                            <span
                                key={index}
                                className={`cursor-pointer border px-3 py-1 rounded-md ${page === index + 1 ? 'bg-gray-400 text-white' : 'hover:bg-gray-200'}`}
                                onClick={() => setPage(index + 1)}
                            >
                                {index + 1}
                            </span>
                        ))
                    }
                </div>

                <button
                    className={`px-2 py-1 cursor-pointer rounded-md ${page >= 11 ? 'bg-green-300' : 'bg-green-500'} disabled:bg-gray-300`}
                    disabled={page >= 11}
                    onClick={(e) => { e.preventDefault(); setPage(prev => prev + 1) }}
                >
                    Next
                </button>
            </div>

            <div className="my-4">
                <span className="block font-medium">College Type:</span>
                <select
                    name="type"
                    onChange={handleChange}
                    value={formData.type}
                    disabled={!edit}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                >
                    <option value="poly">Polytechnic</option>
                    <option value="engg">Engineering</option>
                </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {
                    page === 1 &&
                    <>
                        <div className="p-4 bg-white rounded-md shadow-md">
                            <h2 className="font-bold text-xl mb-4">Officers</h2>

                            {edit && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsOpen(true);
                                    }}
                                    className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                                >
                                    Add Officer
                                </button>
                            )}

                            <div className="space-y-4">
                                {formData.officers.map((officer, index) => (
                                    <OfficerRow
                                        key={index}
                                        officer={officer}
                                        index={index}
                                        onDelete={deleteOfficer}
                                        edit={edit}
                                    />
                                ))}
                            </div>
                        </div>

                        <Modal isOpen={modalIsOpen} onRequestClose={() => setIsOpen(false)}>
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto space-y-6">
                                <h2 className="text-2xl font-bold text-center">Add Officer</h2>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label htmlFor="officer_name" className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            id="officer_name"
                                            className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            value={officerName}
                                            onChange={(e) => setOfficerName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="officer_designation" className="block text-sm font-medium text-gray-700">Designation</label>
                                        <input
                                            type="text"
                                            id="officer_designation"
                                            className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            value={officerDesignation}
                                            onChange={(e) => setOfficerDesignation(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <button
                                        onClick={(e) => { e.preventDefault(); addOfficer(); }}
                                        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setIsOpen(false); }}
                                        className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition duration-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Modal>

                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Institute Name" name="institute_name" type='text' />
                        <div className="flex flex-col mb-4">
                            <label htmlFor="start_date">Start Date</label>
                            <input type="date" name="start_date" id="start_date" onChange={handleChange} value={formData.start_date} disabled={!edit} />
                            <label htmlFor="end_date">End Date</label>
                            <input type="date" name="end_date" id="end_date" onChange={handleChange} value={formData.end_date} disabled={!edit} />
                        </div>
                        {/* <Input edit={edit} formData={formData} handleChange={handleChange} label="Unique Code" name="unique_code" type='text' /> */}
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Principal Name" name="principal_name" type='text' />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Principal contact" name="principal_contact" type='text' />
                    </>
                }

                {
                    page === 2 &&
                    <>
                        <h2 className="font-bold mt-6">1. Intake Capacity and Presence of Students</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 p-2 text-left">Year</th>
                                        <th className="border border-gray-300 p-2 text-left">Admission</th>
                                        <th className="border border-gray-300 p-2 text-left">Present</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <InputRow
                                        edit={edit}
                                        formData={formData}
                                        label="1st Year"
                                        names={["year1_admission", "year1_present"]}
                                        handleChange={handleChange}
                                    />
                                    <InputRow
                                        edit={edit}
                                        formData={formData}
                                        label="2nd Year"
                                        names={["year2_admission", "year2_present"]}
                                        handleChange={handleChange}
                                    />
                                    <InputRow
                                        edit={edit}
                                        formData={formData}
                                        label="3rd Year"
                                        names={["year3_admission", "year3_present"]}
                                        handleChange={handleChange}
                                    />
                                    {formData.type === "engg" && (
                                        <>
                                            <InputRow
                                                edit={edit}
                                                formData={formData}
                                                label="4th Year"
                                                names={["year4_admission", "year4_present"]}
                                                handleChange={handleChange}
                                            />
                                            <InputRow
                                                edit={edit}
                                                formData={formData}
                                                label="MTech 1st Yr"
                                                names={["mtech_1_admission", "mtech_1_present"]}
                                                handleChange={handleChange}
                                            />
                                            <InputRow
                                                edit={edit}
                                                formData={formData}
                                                label="MTech 2nd Yr"
                                                names={["mtech_2_admission", "mtech_2_present"]}
                                                handleChange={handleChange}
                                            />
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>


                        <h2 className="font-bold mt-6">2. Count and presence of the qualified faculty</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 p-2 text-left"></th>
                                        <th className="border border-gray-300 p-2 text-left">Posted</th>
                                        <th className="border border-gray-300 p-2 text-left">Present</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <InputRow edit={edit} formData={formData} label="Full Time" names={["faculty_fulltime_posted", "faculty_fulltime_present"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="Contractual" names={["faculty_contractual_posted", "faculty_contractual_present"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="Guest" names={["faculty_guest_posted", "faculty_guest_present"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="Total" names={["faculty_total_posted", "faculty_total_present"]} handleChange={handleChange} />
                                </tbody>
                            </table>
                        </div>
                    </>
                }


                {/* Page 3 */}
                {
                    page === 3 &&
                    <>
                        <h2 className="font-bold mt-6">3. Hostels and number of students</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th></th>
                                        <th>No. of hostels</th>
                                        <th>Total Capacity</th>
                                        <th>No. of students available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <InputRow edit={edit} formData={formData} label="Boys" names={["boys_hostels", "boys_hostels_capacity", "num_boys_avail"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="Girls" names={["girls_hostels", "girls_hostels_capacity", "num_girls_avail"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="Total" names={["total_hostels", "total_hostels_capacity", "num_students_avail"]} handleChange={handleChange} />
                                </tbody>
                            </table>
                        </div>

                        <h2 className="font-bold mt-6">4. Residence of faculty and other staffs</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th></th>
                                        <th>Faculty</th>
                                        <th>Other staffs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <InputRow edit={edit} formData={formData} label="No. of residence" names={["num_faculty_residence", "num_other_staffs_residence"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="No. of members residing inside" names={["num_faculty_inside", "num_other_staffs_inside"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="No. of members residing outside" names={["num_faculty_outside", "num_other_staffs_outside"]} handleChange={handleChange} />
                                </tbody>
                            </table>
                        </div>
                        {
                            formData.num_faculty_outside > 0 &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Reason for faculty residing outside:" name="reason_faculty_outside" type='text' />
                        }
                        {
                            formData.num_other_staffs_outside > 0 &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Reason for other staffs residing outside:" name="reason_other_staffs_outside" type='text' />
                        }
                    </>
                }

                {/* Page 4 */}
                {
                    page === 4 &&
                    <>
                        <h2 className="font-bold mt-6">5. Classes Conducted</h2>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Expected no. of classes" name="num_classes_expected" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of classes undertaken" name="num_classes_undertaken" />

                        <h2 className="font-bold mt-6">6. Face based biometric attendance (faculty & students)</h2>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of devices available" name="num_biometric_avail" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of classes undertaken" name="num_biometric_functional" />

                        <h2 className="font-bold mt-6">7. Class wise attendance system</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Manually" name="is_manual_attendance" />
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="App based" name="is_app_based_attendance" />
                    </>
                }


                {/* Page 5 */}
                {
                    page === 5 &&
                    <>
                        <h2 className="font-bold mt-6">8. Electricity or Dedicated Feeder</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Installation of dedicated feeder" name="is_dedicated_feeder_installed" />
                        {
                            formData.is_dedicated_feeder_installed === "Yes" &&
                            <>
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of hours of availability" name="feeder_hrs_avail" />
                                <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Power backup available" name="is_power_backup_avail" />
                                {
                                    formData.is_power_backup_avail === "Yes" &&
                                    <BinaryInput edit={edit} formData={formData} handleChange={handleChange} label="Source of power backup" name="power_backup_source" val1="DG Set" val2="Solar" />
                                }
                                {
                                    formData.power_backup_source === "Solar" &&
                                    <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Was Solar backup installed by BREDA" name="was_solar_backup_by_breda" />
                                }
                            </>
                        }

                        <h2 className="font-bold mt-6">9. Classroom</h2>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of required classrooms" name="num_classrooms_required" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of functional classrooms" name="num_classrooms_functional" />

                        <h2 className="font-bold mt-6">10. Laboratory</h2>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of required labs" name="num_labs_required" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of functional labs" name="num_labs_functional" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of students enrolled" name="num_students_enrolled" />
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Are the equipments being used" name="are_equipments_used" />
                        {
                            formData.are_equipments_used === "No" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_equipments_no_use" type='text' />
                        }

                        <h2 className="font-bold mt-6">11. Language Lab</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Established" name="is_lang_lab_established" />
                        {
                            formData.is_lang_lab_established === "Yes" &&
                            <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Is it functional" name="is_lang_lab_functional" />
                        }
                        {
                            formData.is_lang_lab_functional === "Yes" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of students registered" name="num_lang_students_registered" />
                        }
                    </>
                }

                {/* Page 6 */}
                {
                    page === 6 &&
                    <>
                        <h2 className="font-bold mt-6">12. No. of books, journals</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th></th>
                                        <th>Required</th>
                                        <th>Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <InputRow edit={edit} formData={formData} label="Books" names={["num_books_required", "num_books_avail"]} handleChange={handleChange} />
                                    <InputRow edit={edit} formData={formData} label="Journals" names={["num_journals_required", "num_journals_avail"]} handleChange={handleChange} />
                                </tbody>
                            </table>
                        </div>

                        <h2 className="font-bold mt-6">13. Internet / Wifi & Networking</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Internet / Wifi installed" name="is_internet_installed" />
                        {
                            formData.is_internet_installed === "Yes" ?
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="Speed of Internet (Ex: 500Mbps)" name="internet_speed" type='text' /> :
                                formData.is_internet_installed === "No" &&
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_internet" type='text' />
                        }
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Networking facility installed" name="is_networking_installed" />
                        {
                            formData.is_networking_installed === "Yes" ?
                                <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Augmentation work undertaken" name="is_augmentation_undertaken" /> :
                                formData.is_networking_installed === "No" &&
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_networking" type='text' />
                        }
                    </>
                }

                {/* Page 7 */}
                {
                    page === 7 &&
                    <>
                        <h2 className="font-bold mt-6">14. Procurement of Goods (if tender floated)</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Computer procured" name="is_computer_procured" />
                        {
                            formData.is_computer_procured === "Yes" ?
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="% of computers utilized" name="percent_computers_utilized" /> :
                                formData.is_computer_procured === "No" &&
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_computer" type='text' />
                        }
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Machine / Equipment procured" name="is_equipment_procured" />
                        {
                            formData.is_equipment_procured === "Yes" ?
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="% of equipment utilized" name="percent_equipment_utilized" /> :
                                formData.is_equipment_procured === "No" &&
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_no_equipment" type='text' />
                        }

                        <h2 className="font-bold mt-6">15. Library</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Is Library functional" name="is_library_functional" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of students enrolled" name="students_enrolled_in_library" />
                        {
                            formData.is_library_functional === "Yes" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Avg no. of students using it (as per the register or records)" name="students_using_library" />
                        }

                        <h2 className="font-bold mt-6">16. Institute Development Society (IDS)</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Registered" name="is_ids_registered" />
                        {
                            formData.is_ids_registered === "Yes" &&
                            <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Bank account opened" name="was_ids_bank_acc_opened" />
                        }
                        {
                            formData.was_ids_bank_acc_opened === "Yes" &&
                            <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="EC meeting held on time" name="is_ec_meeting_held_on_time" />
                        }
                    </>
                }


                {/* Page 8 */}
                {
                    page === 8 &&
                    <>
                        <h2 className="font-bold mt-6">17. Consultancy work</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="College started Consultancy work" name="was_consultancy_work_started" />
                        {
                            formData.was_consultancy_work_started === "Yes" ?
                                <>
                                    <h3>No. of projects in:</h3>
                                    <Input edit={edit} formData={formData} handleChange={handleChange} label="Category 1" name="num_projects_category1" />
                                    <Input edit={edit} formData={formData} handleChange={handleChange} label="Category 2" name="num_projects_category2" />
                                    <Input edit={edit} formData={formData} handleChange={handleChange} label="Category 3" name="num_projects_category3" />
                                    <Input edit={edit} formData={formData} handleChange={handleChange} label="Category 4" name="num_projects_category4" />

                                    <h3>Financial status:</h3>
                                    <Input edit={edit} formData={formData} handleChange={handleChange} label="Total amount earned" name="consultancy_amount_earned" />
                                    <Input edit={edit} formData={formData} handleChange={handleChange} label="Total amount distributed" name="consultancy_amount_distributed" />
                                    <Input edit={edit} formData={formData} handleChange={handleChange} label="Rest amount in the bank account" name="consultancy_amount_rest" />
                                </> :
                                formData.was_consultancy_work_started === "No" &&
                                <Input edit={edit} formData={formData} handleChange={handleChange} label="Assess the scope for consultancy" name="scope_for_consultancy" type='text' />
                        }

                        <h2 className="font-bold mt-6">18. Constitution of cell / committee</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Meetings taking place as planned" name="are_cell_meetings_ok" />
                        {
                            formData.are_cell_meetings_ok === "No" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Reason for non functioning (committee wise report)" name="reason_cell_non_functioning" type='textarea' />
                        }
                    </>
                }


                {/* Page 9 */}
                {
                    page === 9 &&
                    <>
                        <h2 className="font-bold mt-6">19. Security and other amenities</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Women helpline number functional" name="is_women_helpline_no_functional" />
                        {
                            formData.is_women_helpline_no_functional === "No" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_women_helpline_no_functional" type='text' />
                        }

                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Portable water supply and outlets for drinking water installed at strategic locations" name="is_water_supply_installed" />
                        {
                            formData.is_water_supply_installed === "No" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_water_supply_not_installed" type='text' />
                        }

                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="CCTV cameras installed at vital points" name="is_cctv_installed" />
                        {
                            formData.is_cctv_installed === "No" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Explain the reason" name="reason_cctv_not_installed" type='text' />
                        }

                        <h2 className="font-bold mt-6">20. NBA accreditation</h2>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of files prepared" name="num_nba_acc_files" />

                        <h2 className="font-bold mt-6">21. Pahal</h2>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="No. of Students" name="num_pahal_students" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Total classes per day" name="num_pahal_classes" />
                    </>
                }


                {/* Page 10 */}
                {
                    page === 10 &&
                    <>
                        <h2 className="font-bold mt-6">22. Mandatory Disclosure</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Mandatory disclosure made publicly availabale" name="is_disclosure_made_public" />
                        {
                            formData.is_disclosure_made_public === "No" &&
                            <Input edit={edit} formData={formData} handleChange={handleChange} label="Mention the reason" name="reason_disclosure_not_made_public" type='text' />
                        }

                        <h2 className="font-bold mt-6">23. Mess / Canteen</h2>
                        <YesOrNo edit={edit} formData={formData} handleChange={handleChange} label="Functional" name="is_mess_functional" />
                        {
                            formData.is_mess_functional === "Yes" &&
                            <BinaryInput edit={edit} formData={formData} handleChange={handleChange} label="Who runs it?" name="mess_run_by" val1="College" val2="Students" />
                        }


                        <h2 className="font-bold mt-6">24. Financial Status (amount)</h2>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Pending AC/DC bill amount" name="ac_dc_pending_amount" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Settled AC/DC bill amount" name="ac_dc_settled_amount" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Total amount with the college" name="total_amount_with_college" />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Utilized amount as on date" name="utilized_amount_as_on_date" />
                    </>
                }


                {/* Page 11 */}
                {
                    page === 11 &&
                    <>
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Major Observations / Findings" name="major_observations" type='textarea' />
                        <Input edit={edit} formData={formData} handleChange={handleChange} label="Recommendations for improvement or action" name="recommendations" type='textarea' />
                        <div className="flex items-center space-x-4">
                            <span className="font-bold">Location:</span>
                            <span className="text-gray-900">{formData.location.address}</span>

                            {(id === undefined || id === null) && (
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md border border-blue-500 hover:bg-blue-600 hover:border-blue-600 transition duration-300"
                                    onClick={(e) => { e.preventDefault(); getLocation(); }}
                                >
                                    Update
                                </button>
                            )}
                        </div>

                        <LocationMap position={formData.location.coordinates} />
                        <ImageUploader setFormData={setFormData} preview={id === undefined || id === null ? preview : (edit ? preview : formData.image_url)} handleImageChange={handleImageChange} edit={edit} id={id} />

                        {
                            edit &&
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                                {
                                    id === undefined || id === null ? "Submit" : "Update"
                                }
                            </button>
                        }
                    </>
                }
            </form>
        </div>
    );
};

export default ReportForm;
