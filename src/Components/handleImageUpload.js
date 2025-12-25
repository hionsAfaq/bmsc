// const handleImageUpload = async (campaignId, campaign) => {
//   try {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'image/jpeg, image/jpg, image/png';
    
//     input.onchange = async (e) => {
//       const file = e.target.files[0];
//       if (!file) return;

//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//       if (!validTypes.includes(file.type)) {
//         toast.error('Please select a JPEG or PNG image');
//         return;
//       }

//       // Validate file size (max 5MB)
//       const maxSize = 5 * 1024 * 1024; // 5MB in bytes
//       if (file.size > maxSize) {
//         toast.error('Image size should be less than 5MB');
//         return;
//       }

//       toast.info('Uploading image...', { 
//         autoClose: false,
//         toastId: 'uploadProgress'
//       });
      
//       setUploadingImage(true);
//       const formData = new FormData();
//       formData.append('image', file);
//       formData.append('campaignId', campaignId);
      
//       let locationData = {
//         location: campaign.city || 'Unknown',
//         city: campaign.city || 'Unknown',
//         latitude: 0,
//         longitude: 0
//       };

//       // Try to get location if available
//       if (navigator.geolocation) {
//         try {
//           const position = await new Promise((resolve, reject) => {
//             navigator.geolocation.getCurrentPosition(resolve, reject, {
//               timeout: 5000,
//               maximumAge: 0,
//               enableHighAccuracy: false
//             });
//           });
          
//           locationData = {
//             ...locationData,
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//           };
//         } catch (err) {
//           // Silently fall back to default location
//         }
//       }

//       // Append location data to form
//       Object.entries(locationData).forEach(([key, value]) => {
//         formData.append(key, value);
//       });

//       try {
//         const response = await axios.post(
//           `${import.meta.env.VITE_API_URL}/admin/upload-image`,
//           formData,
//           {
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'multipart/form-data',
//             },
//             onUploadProgress: (progressEvent) => {
//               const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//               toast.update('uploadProgress', { 
//                 render: `Uploading: ${progress}%`
//               });
//             }
//           }
//         );

//         toast.dismiss('uploadProgress');
        
//         if (response.data?.data) {
//           toast.success('Image uploaded successfully');
//           // Refresh the images list
//           handleViewImages(campaignId);
//         } else {
//           throw new Error('Invalid server response');
//         }
//       } catch (error) {
//         toast.dismiss('uploadProgress');
//         const errorMessage = error.response?.data?.message || 
//                            error.response?.data?.error || 
//                            'Failed to upload image';
//         toast.error(errorMessage);
//         console.error('Upload failed:', errorMessage);
//       } finally {
//         setUploadingImage(false);
//       }
//     };

//     input.click();
//   } catch (error) {
//     toast.error('Failed to initiate image upload');
//     console.error('Image upload initialization error:', error);
//     setUploadingImage(false);
//   }
// };

import axios from 'axios';
import { toast } from 'react-toastify';
import { useState } from 'react';

const CampaignImageHandler = ({ token, handleViewImages }) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (campaignId, campaign) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg, image/jpg, image/png';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          toast.error('Please select a JPEG or PNG image');
          return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          toast.error('Image size should be less than 5MB');
          return;
        }

        toast.info('Uploading image...', { 
          autoClose: false,
          toastId: 'uploadProgress'
        });
        
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('campaignId', campaignId);
        
        let locationData = {
          location: campaign.city || 'Unknown',
          city: campaign.city || 'Unknown',
          latitude: 0,
          longitude: 0
        };

        // Try to get location if available
        if (navigator.geolocation) {
          try {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 0,
                enableHighAccuracy: false
              });
            });
            
            locationData = {
              ...locationData,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
          } catch (err) {
            // Silently fall back to default location
          }
        }

        // Append location data to form
        Object.entries(locationData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/admin/upload-image`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                toast.update('uploadProgress', { 
                  render: `Uploading: ${progress}%`
                });
              }
            }
          );

          toast.dismiss('uploadProgress');
          
          if (response.data?.data) {
            toast.success('Image uploaded successfully');
            // Refresh the images list
            handleViewImages(campaignId);
          } else {
            throw new Error('Invalid server response');
          }
        } catch (error) {
          toast.dismiss('uploadProgress');
          const errorMessage = 
            error.response?.data?.message || 
            error.response?.data?.error || 
            'Failed to upload image';
          toast.error(errorMessage);
          console.error('Upload failed:', errorMessage);
        } finally {
          setUploadingImage(false);
        }
      };

      input.click();
    } catch (error) {
      toast.error('Failed to initiate image upload');
      console.error('Image upload initialization error:', error);
      setUploadingImage(false);
    }
  };

  return null;
};

export default CampaignImageHandler;
