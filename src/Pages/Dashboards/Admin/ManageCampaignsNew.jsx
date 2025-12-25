import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Sidebar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CampaignGalleryModal from "../../../Components/CampaignGalleryModal";
import CampaignImageHandler from "../../../Components/CampaignImageHandler";

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [serviceMen, setServiceMen] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignImages, setCampaignImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    noOfBoards: "",
    selectedBoards: [],
    clientEmail: "",
    serviceManEmail: [],
  });

  const token = localStorage.getItem("token");

  // ... rest of the state management and handlers ...

  const handleViewImages = async (campaignId) => {
    try {

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/campaign-images/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const campaign = campaigns.find(c => c._id === campaignId);
      if (!campaign) {
        console.error('Campaign not found:', campaignId);
        toast.error('Campaign information not found');
        return;
      }

      setSelectedCampaign(campaign);
      const images = response.data.data || [];
      if (!Array.isArray(images)) {
        console.error('Invalid image data received:', response.data);
        toast.error('Error loading images');
        return;
      }
      

      if (images.length > 0) {

      } else {

      }

      setCampaignImages(images);
      setShowGallery(true);
    } catch (err) {
      console.error('Fetch images error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch campaign images';
      toast.error(errorMessage);
    }
  };

  // Campaign list rendering with image functionality
  const renderCampaignList = () => (
    <div className="mt-8 grid grid-cols-1 gap-4">
      {campaigns.map((campaign) => (
        <div
          key={campaign._id}
          className="border p-4 rounded shadow bg-white transform transition-all duration-300 hover:shadow-lg"
        >
          <h2 className="text-xl font-semibold text-indigo-600">
            {campaign.name}
          </h2>
          <p>📧 Client Email: {campaign.clientEmail}</p>
          <p>
            👷 Tracker:{" "}
            {Array.isArray(campaign.serviceManEmail)
              ? campaign.serviceManEmail.join(", ")
              : campaign.serviceManEmail || "—"}
          </p>
          <p>📋 Boards: {campaign.noOfBoards}</p>
          <p>
            📅 Duration: {campaign.startDate.slice(0, 10)} →{" "}
            {campaign.endDate.slice(0, 10)}
          </p>
          <p className="italic text-sm text-gray-500">
            Boards:{" "}
            {campaign.selectedBoards
              .map((b) =>
                typeof b === "object" ? `${b.BoardNo} - ${b.City}` : b
              )
              .join(", ")}
          </p>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => handleEdit(campaign)}
              className="bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-500"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(campaign._id)}
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
            <CampaignImageHandler 
              campaignId={campaign._id} 
              campaign={campaign}
              token={token}
              onSuccess={handleViewImages}
            />
            <button
              onClick={() => handleViewImages(campaign._id)}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >
              View Images
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="p-6 w-full">
        <ToastContainer />
        {/* Add Campaign Button */}
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded shadow-md"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditId(null);
              setFormData({
                name: "",
                startDate: "",
                endDate: "",
                noOfBoards: "",
                selectedBoards: [],
                clientEmail: "",
                serviceManEmail: [],
              });
              setSelectedCity("");
              setFilteredBoards([]);
            }
          }}
        >
          {showForm ? "Close Form" : "Add Campaign"}
        </button>

        {/* Campaign Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Form fields... */}
          </form>
        )}

        {/* Campaign List */}
        {renderCampaignList()}

        {/* Image Gallery Modal */}
        <CampaignGalleryModal
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          images={campaignImages}
          campaignName={selectedCampaign?.name || ""}
          campaign={selectedCampaign}
        />
      </div>
    </div>
  );
};

export default ManageCampaigns;