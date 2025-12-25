import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Sidebar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CampaignGalleryModal from "../../../Components/CampaignGalleryModal";
import MapModal from "../../../Components/MapModal";
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

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  // Store all available boards to look up details if needed
  const [allBoards, setAllBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [serviceMen, setServiceMen] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignImages, setCampaignImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCity, setUploadCity] = useState("");

  const [uploadBoardId, setUploadBoardId] = useState("");
  const [uploadCampaignId, setUploadCampaignId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapBoards, setMapBoards] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    noOfBoards: "",
    selectedBoards: [],
    clientEmail: "",
    serviceManEmail: []
  });

  const token = localStorage.getItem("token");

  // Fetch Campaigns, Boards and Clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [campaignRes, boardsRes, usersRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL_GET_ALL_CAMPAIGNS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(import.meta.env.VITE_API_URL_GET_BOARDS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(import.meta.env.VITE_API_URL_GET_ALL_USERS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

  

        const campaignsData = Array.isArray(campaignRes.data)
          ? campaignRes.data
          : campaignRes.data.campaigns || [];

        const boardsData = Array.isArray(boardsRes.data)
          ? boardsRes.data
          : boardsRes.data.boards || boardsRes.data.data || [];

        const usersData = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || usersRes.data.data || [];

        setCampaigns(campaignsData);
        setAllBoards(boardsData);

        const clientUsers = usersData.filter((user) => user.role === "client");

        setClients(clientUsers);

        const usedBoardIds = campaignsData.flatMap((camp) =>
          (camp.selectedBoards || []).map((b) =>
            typeof b === "object" ? b._id : b
          )
        );

        const selectedBoardIds = editId
          ? campaignsData
              .find((c) => c._id === editId)
              ?.selectedBoards.map((b) =>
                typeof b === "object" ? b._id : b
              ) || []
          : [];

        const freeBoards = boardsData.filter(
          (board) =>
            !usedBoardIds.includes(board._id) || selectedBoardIds.includes(board._id)
        );

        const cityList = [...new Set(freeBoards.map((b) => b.City))].filter(Boolean);
        setCities(cityList);

        if (selectedCities.length > 0) {
          setFilteredBoards(
            freeBoards.filter(
              (b) => selectedCities.some(city => b.City.toLowerCase() === city.toLowerCase())
            )
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error details:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Error loading campaigns. Please check your connection and try again."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [token, editId, selectedCities]);

  // Fetch service men when selectedCities changes
  useEffect(() => {
    const fetchServiceMen = async () => {
      if (selectedCities.length === 0) {
        setServiceMen([]);
        return;
      }

      try {
        // Fetch service men for all selected cities
        const allServiceMen = [];
        const uniqueServiceMen = {};
        
        for (const city of selectedCities) {
          try {
            const url = `${import.meta.env.VITE_API_URL_GET_SERVICEMAN_BY_CITY}/${encodeURIComponent(
              city
            )}`;
            const res = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const rawData = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res.data?.serviceMen)
              ? res.data.serviceMen
              : Array.isArray(res.data?.data)
              ? res.data.data
              : [];

            rawData.forEach((item) => {
              let servicePerson;
              if (typeof item === "string") {
                servicePerson = { email: item, name: item };
              } else {
                servicePerson = {
                  _id: item._id,
                  email: item.email || item.serviceManEmail || "",
                  name: item.name || item.fullName || "No Name",
                };
              }
              // Use email as unique key to avoid duplicates
              const key = servicePerson.email || servicePerson._id;
              if (key && !uniqueServiceMen[key]) {
                uniqueServiceMen[key] = servicePerson;
                allServiceMen.push(servicePerson);
              }
            });
          } catch (err) {
            console.error(`Failed to fetch service men for city ${city}:`, err);
          }
        }

        setServiceMen(allServiceMen);
      } catch (err) {
        setServiceMen([]);
        toast.error("Failed to fetch service men for the selected cities.");
        console.error("Service men fetch error:", err);
      }
    };

    fetchServiceMen();
  }, [selectedCities, token]);



  const handleUploadClick = (campaignId) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    if (campaign) {
      setUploadCampaignId(campaignId);
      // Default to first city of campaign if available, or empty
      const defaultCity = campaign.cities && campaign.cities.length > 0 ? campaign.cities[0] : (campaign.city || "");
      setUploadCity(defaultCity);
      setUploadBoardId("");
      setShowUploadModal(true);
    }
  };

  const handleModalClose = () => {
    setShowUploadModal(false);
    setUploadCity("");
    setUploadBoardId("");
    setUploadCampaignId(null);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadCity) {
      toast.error("Please select a city first");
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a JPEG or PNG image');
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const formDataObj = new FormData();
    formDataObj.append('image', file);
    formDataObj.append('campaignId', uploadCampaignId);
    formDataObj.append('location', uploadCity);
    formDataObj.append('city', uploadCity);
    formDataObj.append('latitude', '0');
    formDataObj.append('longitude', '0');

    if (uploadBoardId) {
       formDataObj.append('boardId', uploadBoardId);
       const currentCampaign = campaigns.find(c => c._id === uploadCampaignId);
       if (currentCampaign && currentCampaign.selectedBoards) {
           const boardObj = currentCampaign.selectedBoards.find(b => (typeof b === 'object' ? b._id : b) === uploadBoardId);
           if (typeof boardObj === 'object') {
               formDataObj.append('boardDetails', `${boardObj.BoardNo} - ${boardObj.Location}`);
           }
       }
    }

    const uploadToastId = toast.info('Preparing to upload...', { autoClose: false });

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/upload-image`, formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.update(uploadToastId, { render: `Uploading: ${percent}%` });
        },
      });

      toast.dismiss(uploadToastId);
      if (response.data?.data) {
        toast.success('Image uploaded successfully');
        handleModalClose();
      } else {
        toast.error('Unexpected server response');
      }
    } catch (err) {
      toast.dismiss(uploadToastId);
      const message = err?.response?.data?.message || err?.message || 'Failed to upload image';
      toast.error(message);
      console.error('Upload error', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCityChange = async (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedCities(selectedOptions);
    setFormData((prev) => ({
      ...prev,
      selectedBoards: [],
      serviceManEmail: [],
    }));

    if (selectedOptions.length > 0) {
      try {
        // Fetch boards for all selected cities
        const allBoards = [];
        const uniqueBoards = {};
        
        for (const city of selectedOptions) {
          try {
            const boardsUrl = `${import.meta.env.VITE_API_URL_GET_BOARDS_BY_CITY}/${encodeURIComponent(
              city
            )}`;

            
            const res = await axios.get(boardsUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });



            const boardsData = Array.isArray(res.data)
              ? res.data
              : res.data?.boards || res.data?.data || [];


            
            if (boardsData.length === 0) {

            }

            boardsData.forEach((board) => {
              if (!uniqueBoards[board._id]) {
                uniqueBoards[board._id] = board;
                allBoards.push(board);
              }
            });
          } catch (error) {
            console.error(`Failed to fetch boards for city ${city}:`, error);
          }
        }
        setFilteredBoards(allBoards);
      } catch (error) {
        toast.error("Failed to fetch boards for selected cities.");
        setFilteredBoards([]);
        console.error("Board fetch error:", error);
      }
    } else {
      setFilteredBoards([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "selectedBoards" || name === "serviceManEmail") {
      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);

      setFormData(prev => ({ 
        ...prev, 
        [name]: selected,
        ...(name === "selectedBoards" && { noOfBoards: selected.length.toString() })
      }));
    } else {

      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      startDate,
      endDate,
      selectedBoards,
      clientEmail,
      serviceManEmail,
    } = formData;

    if (
      !name?.trim() ||
      !startDate ||
      !endDate ||
      !clientEmail ||
      !serviceManEmail?.length ||
      !selectedBoards?.length ||
      !selectedCities?.length
    ) {
      toast.error("All required fields must be filled and boards selected.");
      return;
    }

    const url = editId
      ? `${import.meta.env.VITE_API_URL_UPDATE_CAMPAIGN}/${editId}`
      : import.meta.env.VITE_API_URL_CREATE_CAMPAIGN;

    const method = editId ? "put" : "post";

    // Find client information
    const clientObj = clients.find((c) => c.email === clientEmail);
    const clientName = clientObj?.name || clientEmail.split('@')[0];

    // Add default price value to payload without showing in UI
    const payload = {
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      noOfBoards: selectedBoards.length,
      selectedBoards,
      clientEmail: clientEmail.trim(),
      clientName,
      serviceManEmail: Array.isArray(serviceManEmail) ? serviceManEmail : [serviceManEmail],
      cities: selectedCities,
      price: 0
    };

    try {
      await axios[method](url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(`Campaign ${editId ? "updated" : "created"} successfully`);

      setEditId(null);
      setShowForm(false);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        noOfBoards: "",
        selectedBoards: [],
        clientEmail: "",
        serviceManEmail: []
      });
      setSelectedCities([]);
      setFilteredBoards([]);

      const updated = await axios.get(
        import.meta.env.VITE_API_URL_GET_ALL_CAMPAIGNS,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCampaigns(updated.data);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         "Server error while creating/updating campaign";
      toast.error(errorMessage);
      if (err?.response?.data?.fields) {
        console.warn('Validation failed for fields:', err.response.data.fields);
      }
    }
  };

  const handleEdit = (campaign) => {

    let citiesFromCampaign = [];
    if (campaign.selectedBoards && campaign.selectedBoards.length > 0) {
      const uniqueCities = new Set();
      campaign.selectedBoards.forEach((board) => {
        const city = typeof board === "object" ? board.City : "";
        if (city) uniqueCities.add(city);
      });
      citiesFromCampaign = Array.from(uniqueCities);

    }

    setEditId(campaign._id);

    if (citiesFromCampaign.length > 0) {
      setSelectedCities(citiesFromCampaign);
    } else {
      setSelectedCities([]);
    }

    setFormData({
      name: campaign.name,
      startDate: campaign.startDate.slice(0, 10),
      endDate: campaign.endDate.slice(0, 10),
      noOfBoards: campaign.noOfBoards,
      selectedBoards: (campaign.selectedBoards || []).map((b) =>
        typeof b === "object" ? b._id : b
      ),
      clientEmail: campaign.clientEmail,
      serviceManEmail: campaign.serviceManEmail || [],
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL_DELETE_CAMPAIGN}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Campaign deleted");
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error("Failed to delete campaign");
      console.error(err);
    }
  };

  const handleViewImages = async (campaignId) => {
    try {
      const campaign = campaigns.find(c => c._id === campaignId);
      if (!campaign) {
        toast.error('Campaign information not found');
        return;
      }

      setSelectedCampaign(campaign);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/campaign-images/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { data, success, message } = response.data;
      
      if (!success || !Array.isArray(data)) {
        console.error('Invalid response format:', response.data);
        toast.error(message || 'Failed to load campaign images');
        return;
      }

      // Ensure all images have proper URLs
      const processedImages = data.map(img => ({
        ...img,
        imageUrl: img.imageUrl || img.url || img.path || img.image || '',
        role: img.role || 'unknown',
        uploadedBy: img.uploadedBy || 'Unknown'
      })).filter(img => img.imageUrl);

      if (processedImages.length === 0) {
        toast.info('No images available for this campaign');
      }

      setCampaignImages(processedImages);
      setShowGallery(true);
    } catch (err) {
      console.error('Error fetching campaign images:', err);
      toast.error(err.response?.data?.message || 'Failed to load campaign images');
      setShowGallery(false);
      console.error('Fetch images error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch campaign images';
      toast.error(errorMessage);
    }
  };

  const handleViewMap = (campaign) => {
    if (!campaign.selectedBoards || campaign.selectedBoards.length === 0) {
      toast.info("No boards selected for this campaign.");
      return;
    }
    
    // Normalize boards to ensure they are objects with location data
    // existing logic suggests campaign.selectedBoards might contain IDs or Objects
    // But in the fetch, we saw it's populated? 
    // Actually, looking at handleEdit logic: "typeof b === 'object' ? b._id : b"
    // So it might be mixed.
    // However, for the map, we need the full object.
    // The initial fetch populates 'selectedBoards' in the campaign object from the API?
    // Let's verify line 148: "camp.selectedBoards || []"
    // If the API returns populated boards, we are good.
    // If not, we might need to match with 'filteredBoards' or 'boards' if we have access to all boards.
    // In useEffect, we fetch ALL boards. So we can fallback to finding them there.
    // However, 'filteredBoards' is state that changes.
    // Let's rely on the boards passed in campaign if they are objects, or try to find them.
    // Wait, 'campaigns' state comes from 'GET_ALL_CAMPAIGNS'.
    // Use 'allBoards' if available? We don't have 'allBoards' in state, only 'campaigns' and 'filteredBoards'.
    // But we logged "Raw Boards Data" in useEffect.
    // Let's assume for now campaign.selectedBoards contains enough info OR simply
    // filter objects.
    
    // Normalize boards: valid objects pass through, IDs are looked up in allBoards
    const normalizedBoards = campaign.selectedBoards.map(b => {
        if (typeof b === 'object') return b;
        return allBoards.find(board => board._id === b);
    }).filter(Boolean); // remove found failures

    // Filter for valid location data
    // Use loose check != null to allow 0 as a valid coordinate
    const boardsToDisplay = normalizedBoards.filter(b => 
      b.Latitude != null && 
      b.Longitude != null &&
      !isNaN(parseFloat(b.Latitude)) &&
      !isNaN(parseFloat(b.Longitude))
    );
    




    if (boardsToDisplay.length === 0) {
       // If mostly IDs or invalid objects, we might want to warn or try to fetch?
       // For now, let's assume valid populated objects as seen in the UI "Selected Boards: ... Map(b => ...)"
       toast.warning("No boards with valid location data found.");
       return;
    }

    setMapBoards(boardsToDisplay);
    setShowMapModal(true);
  };

  const handleSendReport = async (campaign) => {
    if (!campaign.clientEmail) {
      toast.error("This campaign does not have a client email assigned.");
      return;
    }

    const toastId = toast.loading("Fetching data for report...");
    try {
      // 1. Fetch images
      const imgRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/campaign-images/${campaign._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data, success } = imgRes.data;
      if (!success || !Array.isArray(data) || data.length === 0) {
        toast.update(toastId, { render: "No images found for this campaign.", type: "warning", isLoading: false, autoClose: 3000 });
        return;
      }
      
      const processedImages = data.map(img => ({
          ...img,
          imageUrl: img.imageUrl || img.url || img.path || img.image || '',
      })).filter(img => img.imageUrl);

      if (processedImages.length === 0) {
         toast.update(toastId, { render: "No valid images to generate report.", type: "warning", isLoading: false, autoClose: 3000 });
         return;
      }

      // 2. Generate PPT
      toast.update(toastId, { render: "Generating PowerPoint report..." });
      
      // Dynamic import to avoid top-level issues if any
      const { generateCampaignPPT } = await import("../../../utils/pptGenerator");
      const pptBlob = await generateCampaignPPT(campaign, processedImages);

      // 3. Send to Backend
      toast.update(toastId, { render: "Sending email to client..." });
      
      const formData = new FormData();
      formData.append("file", pptBlob, `${campaign.name.replace(/\s+/g, '_')}_Report.pptx`);
      formData.append("clientEmail", campaign.clientEmail);
      formData.append("campaignName", campaign.name);
      
      await axios.post(`${import.meta.env.VITE_API_URL}/send-report`, formData, {
          headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data" 
          }
      });

      toast.update(toastId, { render: `Report sent successfully to ${campaign.clientEmail}`, type: "success", isLoading: false, autoClose: 5000 });

    } catch (error) {
      console.error("Send report error:", error);
      const msg = error.response?.data?.message || error.message || "Failed to send report";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="p-6 w-full">
        <ToastContainer />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 font-medium">Loading campaigns...</p>
          </div>
        ) : (
          <>
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
              setSelectedCities([]);
              setFilteredBoards([]);
            }
          }}
        >
          {showForm ? "Close Form" : "Add Campaign"}
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <label>
              Campaign Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>
            <label>
              Start Date
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>
            <label>
              Number of Boards
              <input
                type="number"
                name="noOfBoards"
                value={formData.noOfBoards}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>

            <label>
              Client Email
              <select
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              >
                <option value="">-- Select Client --</option>
                {clients.length === 0 && (
                  <option value="" disabled>
                    No clients found
                  </option>
                )}
                {clients.map(({ _id, name, email, city }) => (
                  <option key={_id} value={email}>
                    {`${name} - ${email} - ${city || "-"}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2">
              Select Cities
              <select
                value={selectedCities}
                onChange={handleCityChange}
                className="border p-2 w-full"
                multiple
                required
              >
                <option value="">-- Select Cities --</option>
                {cities.map((city, idx) => (
                  <option key={idx} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2">
              Assign Tracker
              <select
                name="serviceManEmail"
                multiple
                value={formData.serviceManEmail}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              >
                <option value="">-- Select Tracker --</option>
                {serviceMen.length === 0 && (
                  <option value="" disabled>
                    {selectedCities.length > 0
                      ? "No Tracker found"
                      : "Select cities first"}
                  </option>
                )}
                {serviceMen.map(({ _id, email, name }) => (
                  <option key={_id || email} value={email}>
                    {name} - {email}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2">
              Select Boards
              <select
                name="selectedBoards"
                multiple
                value={formData.selectedBoards}
                onChange={handleChange}
                className="border p-2 w-full h-32"
                required
              >
                {filteredBoards.map((board) => (
                  <option key={board._id} value={board._id}>
                    {board.BoardNo} - {board.City}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded col-span-2"
            >
              {editId ? "Update Campaign" : "Create Campaign"}
            </button>
          </form>
        )}

        {/* Search Section */}
        <div className="mt-8 mb-6 p-4 bg-gray-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Search Campaigns</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Campaign Name
              </label>
              <input
                type="text"
                placeholder="Enter campaign name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
            }}
            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {campaigns
            .filter((campaign) => {
              // Filter by campaign name
              const matchesName = campaign.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

              return matchesName;
            })
            .map((campaign) => {
              const campaignCities = campaign.cities || (campaign.city ? [campaign.city] : []);
              return (
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
              <p>🏙️ Cities: {campaignCities.join(", ") || "—"}</p>
              <p>📋 Number of Boards: {campaign.noOfBoards}</p>
              <p>
                📅 Duration: {campaign.startDate.slice(0, 10)} →{" "}
                {campaign.endDate.slice(0, 10)}
              </p>
              <p className="italic text-sm text-gray-500">
                Selected Boards:{" "}
                {campaign.selectedBoards
                  .map((b) =>
                    typeof b === "object" ? `${b.BoardNo} - ${b.City}` : b
                  )
                  .join(", ")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => handleEdit(campaign)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
                <button 
                  onClick={() => handleUploadClick(campaign._id)} 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Image
                </button>
                <button
                  onClick={() => handleViewImages(campaign._id)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Images
                </button>
                <button
                  onClick={() => handleViewMap(campaign)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  View on Map
                </button>
                {/* <button
                  onClick={() => handleSendReport(campaign)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Report
                </button> */}
              </div>
            </div>
              );
            })}
        </div>

        {/* Image Gallery Modal */}
        {showGallery && (
          <CampaignGalleryModal
            isOpen={showGallery}
            onClose={() => setShowGallery(false)}
            images={campaignImages}
            campaignName={selectedCampaign?.name}
            campaign={selectedCampaign}
            token={token}
            onImageDeleted={() => {
              handleViewImages(selectedCampaign?._id);
            }}
          />
        )}
        
        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full shadow-2xl transform transition-all">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Upload Campaign Image</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
                <select 
                  value={uploadCity}
                  onChange={(e) => setUploadCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Select City --</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {uploadCity && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Board</label>
                  <select
                    value={uploadBoardId}
                    onChange={(e) => setUploadBoardId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select Board (Optional) --</option>
                    {(() => {
                        const currentCampaign = campaigns.find(c => c._id === uploadCampaignId);
                        if (!currentCampaign || !currentCampaign.selectedBoards) return null;
                        
                        // Filter selected boards by city
                        return currentCampaign.selectedBoards.map(b => {
                             // If 'b' is just ID, we can't filter by city unless we look it up.
                             // If 'b' is object, we can.
                             if (typeof b !== 'object') return null; 
                             if (b.City !== uploadCity) return null;
                             
                             return (
                                 <option key={b._id} value={b._id}>
                                     {b.BoardNo} - {b.Location}
                                 </option>
                             );
                        });
                    })()}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={handleModalClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <div className="relative">
                  <input
                    type="file"
                    id="modal-file-input"
                    className="hidden"
                    accept="image/jpeg, image/jpg, image/png"
                    onChange={handleFileSelect}
                  />
                  <button 
                    onClick={() => {
                        if (!uploadCity) {
                            toast.error("Please select a city first");
                            return;
                        }
                        document.getElementById('modal-file-input').click();
                    }}
                    disabled={!uploadCity || uploadingImage}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${(!uploadCity || uploadingImage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadingImage ? (
                        <>
                           Uploading...
                        </>
                    ) : "Select Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        <MapModal 
          isOpen={showMapModal} 
          onClose={() => setShowMapModal(false)} 
          boards={mapBoards} 
        />
          </>
        )}
      </div>
    </div>
  );
};

export default ManageCampaigns;
