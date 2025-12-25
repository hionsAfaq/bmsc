import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";

const ClientDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user?.email) {
        toast.error("User email not found");
        return;
      }

      setLoading(true);
      try {

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL_CLIENT_CAMPAIGNS}/${encodeURIComponent(user.email)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );


        const campaignsData = response.data?.data || [];

        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Error fetching campaigns:", error);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else if (error.response?.status === 404) {
          toast.error("API route not found. Please contact support.");
        } else {
          toast.error("Failed to load campaigns.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCampaigns();
    } else {
      toast.error("Login required.");
      navigate("/login");
      setLoading(false);
    }
  }, [token, navigate, user?.email]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10 px-6"
    >
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700 drop-shadow-md">
          📊 All Client Campaigns
        </h1>
        <div className="flex gap-3">
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg"
          >
            Logout
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="overflow-x-auto bg-white rounded-3xl shadow-2xl p-6 border border-indigo-100"
      >
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-indigo-100 text-indigo-800 font-semibold text-left">
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3">Boards</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Verification</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length > 0 ? (
              campaigns.map((campaign, index) => (
                <motion.tr
                  key={campaign._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-indigo-50"
                  } hover:bg-emerald-50 transition-colors`}
                >
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {campaign.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(campaign.startDate).toLocaleDateString() || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(campaign.endDate).toLocaleDateString() || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {campaign.selectedBoards?.map(board => board.BoardNo).join(", ") || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {campaign.city || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">
                    {campaign.price?.toLocaleString() || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      campaign.verificationStatus === 'Verified'
                        ? 'bg-green-100 text-green-800'
                        : campaign.verificationStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.verificationStatus || 'Not Started'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {campaign.verifications?.map((v, i) => (
                      <div key={v._id} className="text-sm">
                        {v.serviceManUpload && (
                          <a 
                            href={v.serviceManUpload.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Image {i + 1}
                          </a>
                        )}
                      </div>
                    ))}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-6 italic">
                  No campaigns available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default ClientDashboard;
