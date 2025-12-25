import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Eye, Calendar, MapPin, User, CheckCircle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const VerifiedCampaigns = () => {
  const [verifiedCampaigns, setVerifiedCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Get user email from token or localStorage
  const getUserEmail = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      return userInfo?.email || "";
    } catch {
      return "";
    }
  };

  const userEmail = getUserEmail();

  useEffect(() => {
    const fetchVerifiedCampaigns = async () => {
      if (!userEmail) {
        toast.error("User email not found. Please login again.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL_CLIENT_CAMPAIGNS}?email=${encodeURIComponent(userEmail)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );


        setVerifiedCampaigns(Array.isArray(response.data) ? response.data : []);
        setFilteredCampaigns(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching verified campaigns:", error);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.response?.status === 404) {
          toast.error("API route not found. Please contact support.");
        } else {
          toast.error("Failed to load verified campaigns.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && userEmail) {
      fetchVerifiedCampaigns();
    } else {
      toast.error("Login required.");
      navigate("/login");
    }
  }, [token, userEmail, navigate]);

  // Filter campaigns by search query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = verifiedCampaigns.filter((verification) => {
      const campaignName = verification.campaign?.name?.toLowerCase() || "";
      const boardLocation = verification.board?.Location?.toLowerCase() || "";
      const boardCity = verification.board?.City?.toLowerCase() || "";
      const serviceManEmail = verification.serviceMan?.email?.toLowerCase() || "";
      
      return (
        campaignName.includes(query) ||
        boardLocation.includes(query) ||
        boardCity.includes(query) ||
        serviceManEmail.includes(query)
      );
    });
    setFilteredCampaigns(filtered);
  }, [searchQuery, verifiedCampaigns]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-10 px-6"
    >
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-green-700 drop-shadow-md flex items-center">
          <CheckCircle className="mr-3" size={40} />
          ✅ Verified Campaigns
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg"
        >
          Logout
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by campaign, location, city, or tracker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600 text-lg">Loading verified campaigns...</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <CheckCircle size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Verified Campaigns Yet</h3>
          <p className="text-gray-500">
            {verifiedCampaigns.length === 0 
              ? "Your campaigns will appear here once they are verified by the admin."
              : "No campaigns match your search criteria."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((verification, index) => (
            <motion.div
              key={verification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100"
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(verification._id)}
                className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 focus:outline-none transition-colors"
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-green-600 mr-2" size={20} />
                    <span className="font-bold text-green-700 text-lg">
                      {verification.campaign?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {verification.board?.Location || "N/A"}, {verification.board?.City || "N/A"}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {formatDate(verification.campaign?.startDate)} - {formatDate(verification.campaign?.endDate)}
                    </div>
                    <div className="flex items-center">
                      <User size={16} className="mr-1" />
                      {verification.serviceMan?.email || "N/A"}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      ✅ Verified on {formatDate(verification.verifiedAt)}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`transition-transform text-gray-400 ${
                    expandedId === verification._id ? "rotate-180" : ""
                  }`}
                  size={24}
                />
              </button>

              {/* Expanded Content */}
              {expandedId === verification._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-4 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaign Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 text-lg mb-3">Campaign Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Campaign Name:</strong> {verification.campaign?.name || "N/A"}</p>
                        <p><strong>Start Date:</strong> {formatDate(verification.campaign?.startDate)}</p>
                        <p><strong>End Date:</strong> {formatDate(verification.campaign?.endDate)}</p>
                        <p><strong>Price:</strong> ₹{verification.campaign?.price?.toLocaleString() || "N/A"}</p>
                        <p><strong>Status:</strong> 
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            {verification.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Board & Service Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 text-lg mb-3">Board & Service Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Board Location:</strong> {verification.board?.Location || "N/A"}</p>
                        <p><strong>City:</strong> {verification.board?.City || "N/A"}</p>
                        <p><strong>Board Size:</strong> {verification.board?.Size || "N/A"}</p>
                        <p><strong>Tracker:</strong> {verification.serviceMan?.email || "N/A"}</p>
                        <p><strong>Verified At:</strong> {formatDateTime(verification.verifiedAt)}</p>
                        {verification.distanceInMeters && (
                          <p><strong>Distance:</strong> {verification.distanceInMeters}m from board</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  {verification.serviceManUpload?.imageUrl && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 text-lg mb-3">Verification Images</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.isArray(verification.serviceManUpload.imageUrl) ? (
                          verification.serviceManUpload.imageUrl.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`Verification ${idx + 1}`}
                                className="w-full h-48 object-cover rounded-lg border shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => window.open(img, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                              </div>
                              <span className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                Image {idx + 1}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="relative group">
                            <img
                              src={verification.serviceManUpload.imageUrl}
                              alt="Verification"
                              className="w-full h-48 object-cover rounded-lg border shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => window.open(verification.serviceManUpload.imageUrl, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="text-green-600 mr-3" size={20} />
                      <div>
                        <h5 className="font-semibold text-green-800">Campaign Successfully Verified!</h5>
                        <p className="text-green-700 text-sm mt-1">
                          This campaign has been verified by our admin team and is now active. 
                          The service has been completed as per your requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default VerifiedCampaigns;