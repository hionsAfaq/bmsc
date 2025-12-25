import Sidebar from "../../../Components/Sidebar";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Predefined list of cities for selection
const CITY_OPTIONS = [
  "Abbottabad",
  "Attock",
  "Bahawalnagar",
  "Bahawalpur",
  "Chiniot",
  "Dera Ghazi Khan",
  "Dera Ismail Khan",
  "Faisalabad",
  "Gujranwala",
  "Gujrat",
  "Gwadar",
  "Hafizabad",
  "Hyderabad",
  "Islamabad",
  "Jacobabad",
  "Jhelum",
  "Jhang",
  "Karachi",
  "Kasur",
  "Khanewal",
  "Khuzdar",
  "Kohat",
  "Lahore",
  "Larkana",
  "Layyah",
  "Lodhran",
  "Malakand",
  "Mandi Bahauddin",
  "Mansehra",
  "Mardan",
  "Mirpur",
  "Mirpur Khas",
  "Multan",
  "Muzaffarabad",
  "Nawabshah",
  "Okara",
  "Peshawar",
  "Quetta",
  "Rahim Yar Khan",
  "Rawalpindi",
  "Sadiqabad",
  "Sahiwal",
  "Sargodha",
  "Sheikhupura",
  "Shikarpur",
  "Sialkot",
  "Sukkur",
  "Swabi",
  "Swat",
  "Tando Adam",
  "Tando Allahyar",
  "Taxila",
  "Turbat",
  "Vehari",
  "Wazirabad",
  "Zhob",
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    password: "",
    role: "client",
  });

  const [editUser, setEditUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    role: "client",
  });

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL_GET_ALL_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUsers(res.data.users || []);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Email uniqueness check
  const isEmailTaken = async (email) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL_CHECK_EMAIL,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.exists;
    } catch (err) {
      console.error("Email check error:", err);
      return false;
    }
  };

  const handleAddUser = async () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    const exists = await isEmailTaken(formData.email);
    if (exists) {
      toast.error("Email already in use");
      return;
    }

    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL_REGISTER,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message || "User registered");
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          password: "",
          role: "client",
        });
        fetchUsers();
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error(
        error.response?.data?.message || "Server error during registration"
      );
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city || "",
      role: user.role,
    });
  };

  const closeEditModal = () => {
    setEditUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL_UPDATE_USER}/${editUser._id}`,
        editFormData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("User updated successfully");
        closeEditModal();
        fetchUsers();
      } else {
        toast.error(res.data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL_DELETE_USER}/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        toast.success("User deleted");
        fetchUsers();
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting user");
    }
  };

  const renderTable = (role) => {
    const filtered = users.filter((u) => u.role === role);
    return (
      <div key={role} className="mb-12">
        <h3 className="text-xl font-bold mb-4 capitalize">{role === 'serviceman' ? 'Trackers' : role + 's'}</h3>
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2563eb] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-left">City</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.phone}</td>
                  <td className="py-3 px-4">{user.address}</td>
                  <td className="py-3 px-4">{user.city}</td>
                  <td className="py-3 px-4">{user.role === 'serviceman' ? 'Tracker' : user.role}</td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-3 text-gray-500">
                    No {role === 'serviceman' ? 'trackers' : role + 's'} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <ToastContainer />
      <div className="flex-1 p-6 overflow-y-auto max-h-screen">
        <h2 className="text-3xl font-bold text-[#2563eb] mb-6">Manage Users</h2>

        {/* Add New User Form */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-8">
          <h3 className="text-xl font-semibold mb-4">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="">Name:</label>
              <br />
              <br />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="">Email:</label>
              <br />
              <br />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="">Phone:</label>
              <br />
              <br />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="">Address:</label>
              <br />
              <br />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="city">City:</label>
              <br />
              <br />
              <select
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select a city</option>
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="">Password:</label>
              <br />
              <br />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="">Select Role:</label>
              <br />
              <br />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="client">Client</option>
                <option value="serviceman">Tracker</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAddUser}
            className="mt-4 bg-[#2563eb] text-white px-4 py-2 rounded hover:bg-[#1e40af]"
          >
            Add User
          </button>
        </div>

        {["client", "serviceman", "manager", "admin"].map((role) => (
          <React.Fragment key={role}>{renderTable(role)}</React.Fragment>
        ))}

        {/* Edit Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Edit User</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="">Name:</label>
                  <br />
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    placeholder="Name"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="">Email:</label>
                  <br />
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    placeholder="Email"
                    className="border p-2 rounded w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="">Phone:</label>
                  <br />
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    placeholder="Phone"
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label htmlFor="">Address:</label>
                  <br />
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditChange}
                    placeholder="Address"
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label htmlFor="edit-city">City:</label>
                  <br />
                  <select
                    name="city"
                    id="edit-city"
                    value={editFormData.city}
                    onChange={handleEditChange}
                    className="border p-2 rounded w-full"
                    required
                  >
                    <option value="">Select a city</option>
                    {CITY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="">Select Role:</label>
                  <br />
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditChange}
                    className="border p-2 rounded w-full"
                    required
                  >
                    <option value="client">Client</option>
                    <option value="serviceman">Tracker</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#2563eb] text-white hover:bg-[#1e40af]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
