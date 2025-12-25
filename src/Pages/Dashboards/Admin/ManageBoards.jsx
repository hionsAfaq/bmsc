import { useState, useEffect } from "react";
import axios from "axios";
import { Menu, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../../../Components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../../../Components/LoadingSpinner";

// Predefined list of Pakistani cities for selection
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

const ManageBoards = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [boards, setBoards] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    BoardNo: "",
    Type: "backlit",
    Location: "",
    City: "",
    Latitude: "",
    Longitude: "",
    Height: "",
    Width: "",
    Quantity: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, [token]); // Re-fetch when token changes

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await axios.get(import.meta.env.VITE_API_URL_GET_BOARDS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(res.data.boards || []);
      if (!res.data.boards || res.data.boards.length === 0) {
        toast.info("No boards found.");
      }
    } catch (err) {
      console.error("Error fetching boards:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load boards. " + (err.response?.data?.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  // 📍 Auto-fetch geolocation and reverse geocode
  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        toast.info("Got coordinates, fetching address...");

        try {
          // Using a more reliable geocoding service with proper user-agent
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'CampaignSoftware/1.0'
              }
            }
          );

          if (!res.ok) {
            throw new Error('Failed to fetch location details');
          }

          const data = await res.json();
          
          // Construct a more readable location string
          const locationParts = [];
          if (data.address) {
            if (data.address.road) locationParts.push(data.address.road);
            if (data.address.suburb) locationParts.push(data.address.suburb);
            if (data.address.city) locationParts.push(data.address.city);
          }
          
          const location = locationParts.length > 0 
            ? locationParts.join(', ') 
            : (data.display_name || "Unknown location");

          setFormData((prev) => ({
            ...prev,
            Latitude: latitude.toFixed(6),
            Longitude: longitude.toFixed(6),
            Location: location,
            City: data.address?.city || prev.City
          }));

          toast.success("Location fetched successfully!");
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.warn("Got coordinates, but couldn't get address. Please enter manually.");
          setFormData((prev) => ({
            ...prev,
            Latitude: latitude.toFixed(6),
            Longitude: longitude.toFixed(6),
          }));
        }
      },
      (err) => {
        toast.error("Failed to access location: " + err.message);
        console.error("Geolocation error:", err);
      }
    );
  };

  const toggleDialog = () => setShowDialog(!showDialog);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // Handle Quantity: Set to null if empty or if type doesn't use it
    if (!payload.Quantity || !['creative', 'digital stream', 'screen digital', 'mall digital screen'].includes(payload.Type)) {
        payload.Quantity = null;
    }

    // Ensure numeric fields are numbers
    payload.Height = Number(payload.Height);
    payload.Width = Number(payload.Width);
    payload.Latitude = Number(payload.Latitude);
    payload.Longitude = Number(payload.Longitude);

    if (isNaN(payload.Height) || isNaN(payload.Width) || isNaN(payload.Latitude) || isNaN(payload.Longitude)) {
        toast.error("Please enter valid numbers for Height, Width, Latitude, and Longitude.");
        return;
    }

    try {
      if (isEditing) {
        await axios.put(
          `${import.meta.env.VITE_API_URL_UPDATE_BOARD}/${editId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Board updated successfully");
      } else {
        await axios.post(import.meta.env.VITE_API_URL_CREATE_BOARD, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Board added successfully");
      }

      setFormData({
        BoardNo: "",
        Type: "backlit",
        Location: "",
        City: "",
        Latitude: "",
        Longitude: "",
        Height: "",
        Width: "",
        Quantity: "",
      });
      setIsEditing(false);
      setEditId(null);
      setShowDialog(false);
      fetchBoards();
    } catch (err) {
      console.error("Error saving board:", err);
      
      const responseData = err.response?.data;
      const errorMessage = responseData?.message || "Failed to save board.";
      
      // Check if it's a duplicate key error (MongoDB code 11000)
      if (responseData?.error?.code === 11000) {
        const field = Object.keys(responseData.error.keyPattern || {})[0];
        if (field) {
            toast.error(`Duplicate value entered for ${field}. Please use a unique value.`);
        } else {
            toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (board) => {
    setFormData({
      BoardNo: board.BoardNo,
      Type: board.Type,
      Location: board.Location,
      City: board.City || "",
      Latitude: board.Latitude,
      Longitude: board.Longitude,
      Height: board.Height,
      Width: board.Width,
      Quantity: board.Quantity || "",
    });
    setIsEditing(true);
    setEditId(board._id);
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this board?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL_DELETE_BOARD}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Board deleted successfully");
      fetchBoards();
    } catch (err) {
      console.error("Error deleting board:", err);
      toast.error("Failed to delete board.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <ToastContainer />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col w-full overflow-y-auto">
        <div className="p-4 bg-white shadow-md md:hidden flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Manage Boards</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-blue-600">Boards</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    BoardNo: "",
                    Type: "backlit",
                    Location: "",
                    City: "",
                    Latitude: "",
                    Longitude: "",
                    Height: "",
                    Width: "",
                    Quantity: "",
                  });
                  toggleDialog();
                  getGeoLocation(); // ⬅️ trigger geo auto-fill
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Add Board
              </button>
            </div>

            {showDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-auto p-6">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    {isEditing ? "Edit Board" : "Add New Board"}
                  </h3>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 min-w-[300px]"
                  >
                    {[
                      "BoardNo",
                      "Type",
                      "Location",
                      "City",
                      "Latitude",
                      "Longitude",
                      "Height",
                      "Width",
                    ].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium mb-1">
                          {field === "BoardNo" ? "Board" : field}
                        </label>
                        {field === "Type" ? (
                          <select
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                          >
                            <option value="backlit">Backlit</option>
                            <option value="frontlit">Frontlit</option>
                            <option value="creative">Creative</option>
                            <option value="digital stream">Digital Stream</option>
                            <option value="screen digital">Screen Digital</option>
                            <option value="mall digital screen">Mall Digital Screen</option>
                          </select>
                        ) : field === "City" ? (
                          <select
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                          >
                            <option value="">Select a city</option>
                            {CITY_OPTIONS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={
                              [
                                "Latitude",
                                "Longitude",
                                "Height",
                                "Width",
                              ].includes(field)
                                ? "number"
                                : "text"
                            }
                            step="any"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                          />
                        )}
                      </div>
                    ))}
                    
                    {/* Conditional Quantity Field - only for digital board types */}
                    {['creative', 'digital stream', 'screen digital', 'mall digital screen'].includes(formData.Type) && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="Quantity"
                          value={formData.Quantity}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                          min="1"
                          required
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={toggleDialog}
                        className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {isEditing ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-600">
                  All Boards
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Filter by City:</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="">All Cities</option>
                    {CITY_OPTIONS.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {boards.length === 0 ? (
                <p className="text-gray-500">No boards found.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {boards
                    .filter(board => !selectedCity || board.City === selectedCity)
                    .map((board) => (
                    <div
                      key={board._id}
                      className="bg-white p-4 rounded shadow border hover:shadow-lg transition relative"
                    >
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(board)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(board._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-blue-600">
                          {board.Type.toUpperCase()}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 my-3 rounded-full ${
                            board.isUsed
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-green-100 text-green-700 border border-green-300'
                          }`}
                        >
                          {board.isUsed ? 'In Campaign' : 'Available'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Board:</strong> {board.BoardNo}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Location:</strong> {board.Location}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>City:</strong> {board.City || "N/A"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Lat/Lon:</strong> {board.Latitude}, {board.Longitude}
                      </p>
                      
                      <p className="text-sm text-gray-700">
                        <strong>Size:</strong> {board.Width}ft x {board.Height}ft
                      </p>
                      {board.Quantity && (
                        <p className="text-sm font-medium text-blue-700 mt-1">
                          <strong>Quantity:</strong> {board.Quantity}
                        </p>
                      )}
                      <button
                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${board.Latitude},${board.Longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        View on Map
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(board.CreatedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBoards;
