import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CampaignImageHandler = ({ campaignId, campaign, token, onSuccess, renderImagesBelow = false }) => {
  const [images, setImages] = useState([]);

  const fetchImages = async () => {
    if (!campaignId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/campaign-images/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load images', err);
      if (token) toast.error('Failed to load campaign images');
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, token]);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg, image/jpg, image/png';

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const confirmed = window.confirm('👉 Are you sure you want to upload an image for this campaign?');
      if (!confirmed) {
        toast.info('❌ Upload cancelled by user.');
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

      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = () => reject(new Error('Invalid image'));
          img.src = URL.createObjectURL(file);
        });
      } catch (err) {
        console.error('Image validation error', err);
        toast.error('Selected file appears to be corrupted or invalid');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('campaignId', campaignId);
      formData.append('location', campaign?.city || 'Unknown');
      formData.append('city', campaign?.city || 'Unknown');

      const uploadToastId = toast.info('Preparing to upload...', { autoClose: false });

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/upload-image`, formData, {
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
          await fetchImages();
          if (onSuccess) onSuccess(campaignId);
        } else {
          toast.error('Unexpected server response');
        }
      } catch (err) {
        toast.dismiss(uploadToastId);
        const message = err?.response?.data?.message || err?.message || 'Failed to upload image';
        toast.error(message);
        console.error('Upload error', err);
      }
    };

    input.click();
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/campaign-images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Image deleted successfully');
      fetchImages();
      if (onSuccess) onSuccess(campaignId);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete image';
      toast.error(message);
      console.error('Delete error', err);
    }
  };

  // If renderImagesBelow is true, render both button and images
  if (renderImagesBelow) {
    return (
      <>
        <button 
          onClick={handleImageUpload} 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Image
        </button>

        {images.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-600 mb-3">{images.length} image{images.length !== 1 ? 's' : ''} uploaded</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image._id} className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-200">
                  <img 
                    src={image.imageUrl} 
                    alt={`Campaign ${campaignId}`} 
                    className="w-full h-48 object-cover group-hover:brightness-75 transition-all duration-300" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="bg-red-500 text-white p-3 rounded-full hover:bg-red-700 transition-all duration-200 shadow-lg hover:scale-110"
                      aria-label="Delete image"
                      title="Delete image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Otherwise, just return the button for inline use
  return (
    <button 
      onClick={handleImageUpload} 
      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Upload Image
    </button>
  );
};

export default CampaignImageHandler;
