
import React, { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaClock,
  FaFileDownload,
  FaSpinner,
  FaStream,
  FaTable,
  FaPrint,
} from 'react-icons/fa';
import pptxgen from 'pptxgenjs';
import LoadingSpinner from './LoadingSpinner';

const CampaignReport = ({ campaign, images }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (!images || images.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;
    const errors = [];

    const preloadImage = (url, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
            setImageLoadErrors(errors);
          }
          resolve(true);
        };
        img.onerror = () => {
          loadedCount++;
          errors.push(index);
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
            setImageLoadErrors(errors);
          }
          resolve(false);
        };
        img.src = url;
      });
    };

    Promise.all(images.map((img, index) => preloadImage(img.imageUrl || img.url, index)));
  }, [images]);

  // Helper function to format date and time properly
  const formatDateAndTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format: "14 Nov 2025, 02:30 PM"
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  // ✅ Fixed and fully working generatePPT function
  const generatePPT = async () => {
    try {
      setGenerating(true);
      setError(null);
      setProgress({ current: 0, total: images?.length || 0 });

      if (!campaign || !images) throw new Error('Campaign or images data is missing');
      if (images.length === 0) throw new Error('No images available for this campaign');

      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Campaign Report Generator';
      pptx.title = `Campaign Report - ${campaign.name}`;

      // === Title Slide ===
      const slide1 = pptx.addSlide();
      slide1.background = { color: '#F0F4F8' };

      // Accent bar
      slide1.addShape('rect', {
        x: 0,
        y: 0,
        w: '5%',
        h: '100%',
        fill: { color: '#1E40AF' },
      });

      // Title
      slide1.addText(campaign.name, {
        x: 1,
        y: 0.8,
        w: '80%',
        fontSize: 48,
        bold: true,
        color: '#1F2937',
      });

      // Subtitle
      slide1.addText('Campaign Report', {
        x: 1,
        y: 1.8,
        w: '80%',
        fontSize: 28,
        color: '#4B5563',
      });

      // Campaign details
      slide1.addText(
        [
          { text: '📅 Generated: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          { text: `${new Date().toLocaleDateString()}\n\n`, options: { fontSize: 14, color: '#374151' } },

          { text: '👤 Client: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          { text: `${campaign.clientEmail || 'N/A'}\n\n`, options: { fontSize: 14, color: '#374151' } },

          { text: '⏱️ Duration: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          {
            text: `${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(
              campaign.endDate
            ).toLocaleDateString()}\n\n`,
            options: { fontSize: 14, color: '#374151' },
          },

          { text: '🎯 Number of Boards: ', options: { bold: true, fontSize: 14, color: '#4B5563' } },
          { text: `${campaign.noOfBoards || 'N/A'}`, options: { fontSize: 14, color: '#374151' } },
        ],
        { x: 1, y: 2.8, w: '80%', lineSpacing: 16 }
      );

      // === Image Slides ===
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setProgress((prev) => ({ ...prev, current: i + 1 }));
        const slide = pptx.addSlide();

        try {
          const imageUrl = image.imageUrl || image.url;
          const response = await fetch(imageUrl);

          if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);

          const blob = await response.blob();
          if (!blob.type.startsWith('image/')) throw new Error('Invalid image format');

          const imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // Image (70%)
          slide.addImage({
            data: imageData,
            x: 0.2,
            y: 0.4,
            w: 7.0,
            h: 4.8,
            sizing: { type: 'contain', w: 7.0, h: 4.8 },
          });

          // Info box (30%)
          slide.addShape('rect', {
            x: 7.3,
            y: 0.4,
            w: 2.5,
            h: 4.8,
            fill: { color: '#F8F9FA' },
            line: { color: '#E5E7EB', width: 1 },
          });

          // Info text
          // --- DETAILED TEXT FIELDS (Fixed Y coordinates to prevent shifting) ---
          
          // 1. Header
          slide.addText('Image Details', { x: 7.45, y: 0.5, w: 2.2, h: 0.4, bold: true, fontSize: 16, color: '#1F2937' });

          // 2. Board Info (with Quantity) - Moved UP
          slide.addText('Board:', { x: 7.45, y: 1.0, w: 2.2, h: 0.3, bold: true, fontSize: 11, color: '#4B5563' });
          slide.addText(image.boardDetails || 'N/A', { x: 7.45, y: 1.3, w: 2.2, h: 0.4, fontSize: 10, color: '#374151', wrap: true });

          if (image.boardQuantity) {
             slide.addText(`Qty: ${image.boardQuantity}`, { x: 7.45, y: 1.8, w: 2.2, h: 0.3, bold: true, fontSize: 10, color: '#1E40AF' });
          }

          // 3. Location - Moved UP
          slide.addText('Location:', { x: 7.45, y: 2.2, w: 2.2, h: 0.3, bold: true, fontSize: 11, color: '#4B5563' });
          slide.addText(image.location || image.liveLocation || 'N/A', { x: 7.45, y: 2.5, w: 2.2, h: 0.5, fontSize: 10, color: '#374151', wrap: true });

          // 4. Date - Moved UP
          slide.addText('Date:', { x: 7.45, y: 3.1, w: 2.2, h: 0.3, bold: true, fontSize: 11, color: '#4B5563' });
          slide.addText(formatDateAndTime(image.uploadedAt || image.createdAt || image.timestamp || image.dateTime), 
            { x: 7.45, y: 3.4, w: 2.2, h: 0.3, fontSize: 10, color: '#374151' });
          
          // 5. Role - Moved UP
          slide.addText('Role:', { x: 7.45, y: 3.8, w: 2.2, h: 0.3, bold: true, fontSize: 11, color: '#4B5563' });
          slide.addText(image.role || 'Tracker', { x: 7.45, y: 4.1, w: 2.2, h: 0.3, fontSize: 10, color: '#374151' });

          // Footer
          slide.addText(`Image ${i + 1} of ${images.length}`, {
            x: 0.5,
            y: 5.3,
            fontSize: 9,
            color: '#6B7280',
            italic: true,
          });
        } catch (imgError) {
          console.error('Error adding image:', imgError);
          slide.addText(`Error loading image #${i + 1}\n${imgError.message}`, {
            x: 1,
            y: 2,
            fontSize: 18,
            color: '#FF0000',
          });
        }
      }

      // Save file
      const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pptx`;
      await pptx.writeFile({ fileName });
      setGenerating(false);
      setError(null);
    } catch (error) {
      console.error('Error generating report:', error);
      setGenerating(false);
      setError(error.message || 'Error generating report. Please try again.');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handlePrint = () => window.print();

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Campaign Report</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded ${
                  viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaStream className="inline mr-2" /> Timeline
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaTable className="inline mr-2" /> Grid
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors print:hidden"
            >
              <FaPrint className="inline mr-2" /> Print Report
            </button>
            <button
              onClick={generatePPT}
              disabled={generating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 print:hidden"
            >
              {generating ? (
                <>
                  <FaSpinner className="animate-spin" /> Generating PPT... ({progress.current}/
                  {progress.total})
                </>
              ) : (
                <>
                  <FaFileDownload /> Export to PPT
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded mb-4">
            ⚠️ {error}
          </div>
        )}

        {!imagesLoaded ? (
          <div className="flex flex-col items-center justify-center p-8">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading campaign images...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Campaign Images</h2>
            {viewMode === 'timeline' ? (
              <div className="space-y-4">
                {images.map((image, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                    <div className="w-48 h-48 flex-shrink-0 relative">
                      {imageLoadErrors.includes(index) ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                          <span className="text-red-500">Failed to load image</span>
                        </div>
                      ) : (
                        <img
                          src={image.imageUrl || image.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            if (!imageLoadErrors.includes(index)) {
                              setImageLoadErrors((prev) => [...prev, index]);
                            }
                            e.target.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded"><span class="text-red-500">Failed to load image</span></div>';
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg font-medium">Upload #{index + 1}</p>
                      <p className="text-gray-500 flex items-center gap-2">
                        <FaClock className="inline" />
                        {formatDate(image.timestamp || image.createdAt || image.dateTime)}
                      </p>
                      <p className="flex items-center gap-2 mt-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {image.location || image.liveLocation || 'Location not specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Uploaded by: {image.uploadedBy || image.serviceManEmail || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-w-4 aspect-h-3">
                      {imageLoadErrors.includes(index) ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-red-500">Failed to load image</span>
                        </div>
                      ) : (
                        <img
                          src={image.imageUrl || image.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium">
                        {formatDate(image.timestamp || image.createdAt || image.dateTime)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {image.location || image.liveLocation || 'Location not specified'}
                      </p>
                      <p className="text-sm text-gray-500">
                        By: {image.uploadedBy || image.serviceManEmail || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignReport;



