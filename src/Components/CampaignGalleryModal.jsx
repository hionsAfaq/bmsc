import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaExpandAlt, FaFileAlt, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import CampaignReport from './CampaignReport';

const CampaignGalleryModal = ({ isOpen, onClose, images, campaignName, campaign, token, onImageDeleted }) => {
  const [showReport, setShowReport] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [imageList, setImageList] = useState(images);

  React.useEffect(() => {
    setImageList(images);
  }, [images]);

  if (!isOpen) return null;

  const handleImageLoad = (imageId) => {
    setImageLoading(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  const handleImageError = (imageId) => {
    setImageLoading(prev => ({
      ...prev,
      [imageId]: false
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/campaign-images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Image deleted successfully');
      
      // Remove from local list
      const updatedImages = imageList.filter(img => img._id !== imageId);
      setImageList(updatedImages);
      setSelectedImage(null);
      
      // Call callback to notify parent
      if (onImageDeleted) onImageDeleted(imageId);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete image';
      toast.error(message);
      console.error('Delete error', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{campaignName} - Campaign Images</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {images.length} images • Last update: {
                images.length > 0 
                  ? formatDate(
                      images[images.length - 1].uploadedAt || 
                      images[images.length - 1].timestamp || 
                      images[images.length - 1].createdAt || 
                      images[images.length - 1].dateTime
                    ) 
                  : 'N/A'
              }
            </div>
            {images.length > 0 && campaign && (
              <button
                onClick={() => setShowReport(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaFileAlt /> Generate Report
              </button>
            )}
          </div>
        </div>

        {showReport && (
          <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Campaign Report</h2>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <CampaignReport campaign={campaign} images={images} />
            </div>
          </div>
        )}
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          {imageList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <p className="text-center">No images uploaded yet for this campaign</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageList.map((image, index) => (
                <div 
                  key={image._id || index} 
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative w-full h-48 bg-gray-200">
                    <img
                      src={image.imageUrl}
                      alt={`Campaign ${campaignName} - ${image.uploadedBy || 'Unknown'}`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      onLoad={() => handleImageLoad(image._id)}
                      onError={(e) => {
                        handleImageError(image._id);
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    {imageLoading[image._id] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <FaSpinner className="animate-spin text-gray-400 text-2xl" />
                      </div>
                    )}
                    {image.role && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {image.role}
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
                      title="Delete image"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {image.uploadedBy || image.serviceManEmail || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {image.location || image.liveLocation || 'Location not available'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(image.uploadedAt || image.timestamp || image.createdAt || image.dateTime)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setSelectedImage(image)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <FaExpandAlt className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <FaTrash className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-[90vw] max-h-[90vh] relative group">
            <img
              src={selectedImage.imageUrl}
              alt={`Full size - ${selectedImage.uploadedBy || 'Unknown'}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteImage(selectedImage._id);
              }}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
              title="Delete image"
            >
              <FaTrash className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded">
              <p className="text-sm mb-2">
                {selectedImage.uploadedBy || selectedImage.serviceManEmail || 'Unknown'} 
                {selectedImage.role && ` (${selectedImage.role})`}
              </p>
              <p className="text-xs">
                {selectedImage.location || selectedImage.liveLocation || 'Location not available'}
              </p>
              {selectedImage.city && (
                <p className="text-xs mt-1">City: {selectedImage.city}</p>
              )}
              <p className="text-xs mt-1">
                {formatDate(selectedImage.uploadedAt || selectedImage.timestamp || selectedImage.createdAt || selectedImage.dateTime)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignGalleryModal;
