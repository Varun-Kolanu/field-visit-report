import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useUser } from "../context/context";
import axios from "../utils/axiosInstance";

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        if (user && user.role !== "admin") window.location.href = "/"
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/users", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                setError("Error fetching users", err);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = (id, newRole) => {
        setUsers((prev) =>
            prev.map((user) => (user._id === id ? { ...user, role: newRole } : user))
        );
    };

    const saveRoleChange = async (id, role) => {
        try {
            await axios.patch(`/users/${id}`, { role }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            toast.success("Role updated successfully!");
        } catch (err) {
            toast.error("Error updating role");
            setError("Error updating role", err);
        }
    };

    if (loading) return <Loader />
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
            <div className="overflow-x-scroll w-[100vw]">
                <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Name</th>
                            <th className="border border-gray-300 p-2">Email</th>
                            <th className="border border-gray-300 p-2">Role</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="border border-gray-300 p-2">{user.name}</td>
                                <td className="border border-gray-300 p-2 text-wrap">
                                    {user.email}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                    </select>
                                </td>
                                <td className="border border-gray-300 p-2">
                                    <button
                                        onClick={() => saveRoleChange(user._id, user.role)}
                                        className="bg-blue-500 text-white px-4 py-1 rounded"
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
