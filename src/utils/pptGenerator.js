import pptxgen from 'pptxgenjs';

export const generateCampaignPPT = async (campaign, images) => {
  return new Promise(async (resolve, reject) => {
    try {
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

      // Helper for date formatting
      const formatDateAndTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return 'N/A';
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

      // === Image Slides ===
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const slide = pptx.addSlide();

        try {
          const imageUrl = image.imageUrl || image.url;
          // Note: pptxgenjs handles image fetching internally if passed a URL,
          // but we fetch manually to validate/blob it if needed, or just let pptxgen handle it.
          // For stability, and since we just want to pass it to pptxgen:
          
          // However, pptxgenjs 3.x+ supports remote URLs directly if CORS allows.
          // If previous implementation used fetch/blob, we keep it if that was working better.
          // But to simplify the utility, let's try direct URL first inside the slide.addImage.
          // Wait, the previous implementation did fetch/blob. Let's stick to that for robustness against CORS issues with canvas taint.
          
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
          const blob = await response.blob();
          
          const reader = new FileReader();
          const dataUrl = await new Promise((res, rej) => {
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
          });

          // Image (70%)
          slide.addImage({
            data: dataUrl,
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
          slide.addText('Image Details', { x: 7.45, y: 0.5, w: 2.2, h: 0.4, bold: true, fontSize: 16, color: '#1F2937' });

          slide.addText('Board:', { x: 7.45, y: 1.0, w: 2.2, h: 0.3, bold: true, fontSize: 11, color: '#4B5563' });
          slide.addText(image.boardDetails || 'N/A', { x: 7.45, y: 1.3, w: 2.2, h: 0.4, fontSize: 10, color: '#374151', wrap: true });

          if (image.boardQuantity) {
             slide.addText(`Qty: ${image.boardQuantity}`, { x: 7.45, y: 1.8, w: 2.2, h: 0.3, bold: true, fontSize: 10, color: '#1E40AF' });
          }

          slide.addText('Location:', { x: 7.45, y: 2.2, w: 2.2, h: 0.3, bold: true, fontSize: 11, color: '#4B5563' });
          slide.addText(image.location || image.liveLocation || 'N/A', { x: 7.45, y: 2.5, w: 2.2, h: 0.5, fontSize: 10, color: '#374151', wrap: true });

          slide.addText('Date:', { x: 7.45, y: 3.1, w: 2.2, h: 0.3, bold: true, fontSize: 11, color: '#4B5563' });
          slide.addText(formatDateAndTime(image.uploadedAt || image.createdAt || image.timestamp || image.dateTime), 
            { x: 7.45, y: 3.4, w: 2.2, h: 0.3, fontSize: 10, color: '#374151' });
          
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
          console.error(`Error adding slide for image ${i}:`, imgError);
          slide.addText(`Error loading image\n${imgError.message}`, {x:1, y:2, color:'red'});
        }
      }

      // Instead of writing file locally (which triggers download), we want to get a blob to send to server.
      // But user also wants to download it? The feature request was "send report".
      // Usually good to let them verify it.
      // But for automatic sending, we need the Blob.
      // pptxgenjs >= 3.0 supports write('blob').

      const blob = await pptx.write('blob');
      resolve(blob);

    } catch (error) {
      reject(error);
    }
  });
};
