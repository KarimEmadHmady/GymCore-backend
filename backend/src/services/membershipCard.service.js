import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.model.js';
import { getGymSettingsService } from './gymSettings.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only create cards directory in development
if (process.env.NODE_ENV !== 'production') {
  const cardsDir = path.join(__dirname, '../../cards');
  if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
  }
}

/**
 * Generate QR Code for user
 * @param {string} barcode - User's barcode
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @returns {Promise<Buffer>} QR Code buffer
 */
const generateQRCode = async (barcode) => {
  try {
    
    // Create QR data with user profile link and basic info
    const qrData = `${process.env.FRONTEND_URL}/member/profile/${barcode}`;

    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      type: 'png',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF1A' // Reverted to white hex color
      }
    });

    return qrCodeBuffer;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

/**
 * Generate Barcode for user
 * @param {string} barcode - User's barcode value
 * @returns {Promise<Buffer>} Barcode buffer
 */
const generateBarcode = async (barcode) => {
  try {
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',        // Barcode type
      text: barcode,          // Text to encode
      scale: 3,               // Scaling factor
      height: 50,             // Bar height, in millimeters
      includetext: true,      // Show human-readable text
      textxalign: 'center',   // Always good to set this
    });

    return barcodeBuffer;
  } catch (error) {
    throw new Error(`Barcode generation failed: ${error.message}`);
  }
};

/**
 * Generate front side of membership card
 * @param {Object} user - User object
 * @returns {Promise<{buffer: Buffer, fileName: string}>} PDF buffer and filename
 */
const generateMembershipCardFrontPDF = async (user) => {
  try {
    const { name, barcode } = user;
    const settings = await getGymSettingsService();
    const frontStyle = settings?.membershipCardFront || {};
    
    if (!frontStyle.showFrontDesign) {
      return null; // Don't generate front if not enabled
    }

    const backgroundColor = frontStyle.backgroundColor || '#ffffff';
    const backgroundImage = frontStyle.backgroundImage || '';
    const patternImage = frontStyle.patternImage || '';
    const patternOpacity = frontStyle.patternOpacity || 0.1;
    const centerLogoUrl = frontStyle.centerLogoUrl || '';
    const centerLogoWidth = frontStyle.centerLogoWidth || 120;
    const centerLogoHeight = frontStyle.centerLogoHeight || 120;
    const backgroundOpacity = typeof frontStyle.backgroundOpacity === 'number' ? frontStyle.backgroundOpacity : 1; // New: Default to 1

    // Create PDF document
    const doc = new PDFDocument({
      size: [400, 250], // Same size as back card
      margin: 20
    });

    // Generate filename
    const fileName = `membership_card_front_${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Collect PDF data in chunks
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Card background (rectangular, no rounded corners)
    doc.rect(0, 0, 400, 250)
       .fill(backgroundColor);

    // Add background image if provided
    if (backgroundImage) {
      try {
        const res = await fetch(backgroundImage);
        if (!res.ok) {
          console.error(`Error: Failed to fetch background image from ${backgroundImage}. Status: ${res.status}`);
          return; // Stop processing this image
        }
        const imageArrayBuffer = await res.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        
        // Draw the image first
        doc.image(imageBuffer, 0, 0, {
          width: 400,
          height: 250,
        });

        // Then draw a semi-transparent rectangle over it to simulate opacity
        doc.save(); // Save current state
        doc.fillOpacity(1 - backgroundOpacity); // Inverse opacity for the fill color
        doc.fillColor(backgroundColor); // Use the background color
        doc.rect(0, 0, 400, 250).fill();
        doc.restore(); // Restore state
      } catch (e) { console.error('Error loading background image:', e); }
    }

    // Add pattern overlay if provided
    if (patternImage) {
      try {
        const res = await fetch(patternImage);
        if (res.ok) {
          const patternArrayBuffer = await res.arrayBuffer();
          const patternBuffer = Buffer.from(patternArrayBuffer);
          
          // Save current state
          doc.save();
          
          // Set opacity for pattern
          doc.fillColor(`rgba(255, 255, 255, ${patternOpacity})`);
          doc.rect(0, 0, 400, 250).fill();
          
          // Draw pattern
          doc.image(patternBuffer, 0, 0, { 
            width: 400, 
            height: 250, 
            fit: [400, 250]
          });
          
          // Restore state
          doc.restore();
        }
      } catch {}
    }

    // Add center logo if provided
    if (centerLogoUrl) {
      try {
        const res = await fetch(centerLogoUrl);
        if (res.ok) {
          const logoArrayBuffer = await res.arrayBuffer();
          const logoBuffer = Buffer.from(logoArrayBuffer);
          
          // Center the logo
          const logoX = (400 - centerLogoWidth) / 2;
          const logoY = (250 - centerLogoHeight) / 2;
          
          doc.image(logoBuffer, logoX, logoY, { 
            width: centerLogoWidth, 
            height: centerLogoHeight, 
            fit: [centerLogoWidth, centerLogoHeight] 
          });
        }
      } catch {}
    }



    // Add optional phone and address if enabled and present
    if (frontStyle.showContactInfo) {
      doc.fillColor(frontStyle.contactInfoColor || '#333333');
      doc.fontSize(frontStyle.contactInfoFontSize || 8);
      let contactY = 220; // Position near bottom

      if (user.phone) {
        doc.text(`📞 ${user.phone}`, 20, contactY);
        contactY += (frontStyle.contactInfoLineHeight || 10);
      }
      if (user.address) {
        doc.text(`📍 ${user.address}`, 20, contactY);
      }
    }

    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ buffer, fileName });
      });
      doc.on('error', (err) => {
        reject(err);
      });
    });

  } catch (error) {
    throw new Error(`Front card generation failed: ${error.message}`);
  }
};

/**
 * Generate PDF membership card as Buffer
 * @param {Object} user - User object
 * @returns {Promise<{buffer: Buffer, fileName: string}>} PDF buffer and filename
 */
const generateMembershipCardPDF = async (user) => {
  try {
    const { barcode, name, email, membershipLevel, subscriptionEndDate } = user;
    const settings = await getGymSettingsService();
    const style = settings?.membershipCardStyle || {};
    const backgroundColor = style.backgroundColor || '#f8f9fa';
    const textColor = style.textColor || '#000000';
    const backgroundImage = style.backgroundImage || ''; // Add background image
    const backgroundOpacity = typeof style.backgroundOpacity === 'number' ? style.backgroundOpacity : 1; // New: Default to 1
    
    // Define cardPadding here
    const cardPadding = 10; // Adjusted padding for 95% width

    // Generate QR Code and Barcode
    const [qrCodeBuffer, barcodeBuffer] = await Promise.all([
      generateQRCode(barcode),
      generateBarcode(barcode)
    ]);

    // Create PDF document
    const doc = new PDFDocument({
      size: [400, 250], // Card size in points (4x2.5 inches)
      margin: 20
    });

    // Generate filename with user name
    const fileName = `membership_card_${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Collect PDF data in chunks
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Card background (rectangular, no rounded corners) - Fill this first
    doc.rect(0, 0, 400, 250)
       .fill(backgroundColor);

    // Add background image if provided (draw this on top with opacity)
    if (backgroundImage) {
      try {
        const res = await fetch(backgroundImage);
        if (!res.ok) {
          console.error(`Error: Failed to fetch background image from ${backgroundImage}. Status: ${res.status}`);
          return; // Stop processing this image
        }
        const imageArrayBuffer = await res.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        
        // Draw the image first
        doc.image(imageBuffer, 0, 0, {
          width: 400,
          height: 250,
        });

        // Then draw a semi-transparent rectangle over it to simulate opacity
        doc.save(); // Save current state
        doc.fillOpacity(1 - backgroundOpacity); // Inverse opacity for the fill color
        doc.fillColor(backgroundColor); // Use the background color
        doc.rect(0, 0, 400, 250).fill();
        doc.restore(); // Restore state
      } catch (e) {console.error('Error loading background image:', e);}
    }

    
    // Layout for Barcode and QR Code (side by side)
    const cardWidth = 400;
    const cardHeight = 250;
    const targetContentScale = 0.9; // Target 90% of the card width for the barcode/QR block

    // Original dimensions of the barcode/QR block
    const originalBarcodeVisualWidth = 280; 
    const originalQrCodeVisualSize = 90;    
    const originalGap = 10; 
    const originalBarcodeHeight = 90; // The height of the barcode image

    // Calculate the total width of the original block
    const originalTotalVisualWidth = originalBarcodeVisualWidth + originalGap + originalQrCodeVisualSize;

    // Calculate the scaling factor needed to fit into 90% of cardWidth
    const scalingFactor = (cardWidth * targetContentScale) / originalTotalVisualWidth;

    // Apply scaling factor to all dimensions, rounding to nearest integer
    const barcodeVisualWidth = Math.round(originalBarcodeVisualWidth * scalingFactor);
    const qrCodeVisualSize = Math.round(originalQrCodeVisualSize * scalingFactor);
    const gap = Math.round(originalGap * scalingFactor);
    const barcodeHeight = Math.round(originalBarcodeHeight * scalingFactor);

    // Calculate the new total width of the scaled block
    const newTotalVisualWidth = barcodeVisualWidth + gap + qrCodeVisualSize;

    // Calculate startX to center the scaled block horizontally within the card
    const startX = (cardWidth - newTotalVisualWidth) / 2;

    // Calculate startY to center the scaled block vertically within the card,
    // considering the scaled barcode height and text below it .
    const barcodeTextHeight = 9; // Approx height for fontSize 9
    const qrTextHeight = 7;      // Approx height for fontSize 7
    const textSpacing = 5;       // Space between image and text

    const barcodeBlockHeight = barcodeHeight + textSpacing + barcodeTextHeight;
    const qrBlockHeight = qrCodeVisualSize + textSpacing + qrTextHeight;

    const blockHeight = Math.max(barcodeBlockHeight, qrBlockHeight);
    const startY = (cardHeight - blockHeight) / 2;
    
    // Barcode (centered within its allocated width)
    const barcodeX = startX;
    const qrCodeX = startX + barcodeVisualWidth + gap; // Define qrCodeX here
    doc.image(barcodeBuffer, barcodeX, startY, { width: barcodeVisualWidth, height: barcodeHeight });
    doc.fillColor(textColor)
       .fontSize(9)
       .text(barcode, barcodeX, startY + barcodeHeight + textSpacing, { width: barcodeVisualWidth, align: 'center' });

    // QR Code (next to barcode, within its allocated width)
    doc.fillColor(textColor)
       .fontSize(7)
       .text('Scan to View Profile', qrCodeX, startY + qrCodeVisualSize + textSpacing, { width: qrCodeVisualSize, align: 'center' });
    
    // Footer Text (optional, can be gym name or website)
    
    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ buffer, fileName });
      });
      doc.on('error', (err) => {
        reject(err);
      });
    });

  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

/**
 * Draw a membership card onto an existing PDF document at a given position
 * @param {PDFDocument} doc
 * @param {Object} user
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
const drawMembershipCardOnDoc = async (doc, user, x, y, width, height) => {
  const { barcode, name, email, membershipLevel, subscriptionEndDate } = user;
  const settings = await getGymSettingsService();
  const style = settings?.membershipCardStyle || {};
  const backgroundColor = style.backgroundColor || '#f8f9fa';
  const textColor = style.textColor || '#000000';
  const backgroundImage = style.backgroundImage || ''; // Add background image
  const backgroundOpacity = typeof style.backgroundOpacity === 'number' ? style.backgroundOpacity : 1; // New: Default to 1

  // Define cardPadding here
  const cardPadding = 10; // Adjusted padding for 95% width

  // Generate assets to match single card
  const [qrCodeBuffer, barcodeBuffer] = await Promise.all([
    generateQRCode(barcode),
    generateBarcode(barcode)
  ]);

  // Draw exactly like the single-card PDF at origin, but translate to (x,y)
  doc.save();
  doc.translate(x, y);

  // Background 400x250 (rectangular, no rounded corners) - Fill this first
  doc.rect(0, 0, 400, 250)
     .fill(backgroundColor);
  
  // Add background image if provided (draw this on top with opacity)
  if (backgroundImage) {
    try {
      const res = await fetch(backgroundImage);
      if (!res.ok) {
        console.error(`Error: Failed to fetch background image from ${backgroundImage}. Status: ${res.status}`);
        return; // Stop processing this image
      }
      const imageArrayBuffer = await res.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      
      // Draw the image first
      doc.image(imageBuffer, 0, 0, {
        width: 400,
        height: 250,
      });

      // Then draw a semi-transparent rectangle over it to simulate opacity
      doc.save(); // Save current state
      doc.fillOpacity(1 - backgroundOpacity); // Inverse opacity for the fill color
      doc.fillColor(backgroundColor); // Use the background color
      doc.rect(0, 0, 400, 250).fill();
      doc.restore(); // Restore state
    }
    catch (e) {console.error('Error loading background image:', e);}
  }

  
   // Layout for Barcode and QR Code (side by side)
    const cardWidth = 400;
    const cardHeight = 250;
    const targetContentScale = 0.9; // Target 90% of the card width for the barcode/QR block

    // Original dimensions of the barcode/QR block
    const originalBarcodeVisualWidth = 280; 
    const originalQrCodeVisualSize = 90;    
    const originalGap = 10; 
    const originalBarcodeHeight = 90; // The height of the barcode image

    const originalTotalVisualWidth = originalBarcodeVisualWidth + originalGap + originalQrCodeVisualSize;

    // Calculate the scaling factor needed to fit into 90% of cardWidth
    const scalingFactor = (cardWidth * targetContentScale) / originalTotalVisualWidth;
    // Apply scaling factor to all dimensions, rounding to nearest integer
    const barcodeVisualWidth = Math.round(originalBarcodeVisualWidth * scalingFactor);
    const qrCodeVisualSize = Math.round(originalQrCodeVisualSize * scalingFactor);
    const gap = Math.round(originalGap * scalingFactor);
    const barcodeHeight = Math.round(originalBarcodeHeight * scalingFactor);
    // Calculate the new total width of the scaled block
    const newTotalVisualWidth = barcodeVisualWidth + gap + qrCodeVisualSize;

    // Calculate startX to center the scaled block horizontally within the card
    const startX = (cardWidth - newTotalVisualWidth) / 2;

    // Calculate startY to center the scaled block vertically within the card,
    // considering the scaled barcode height and text below it.
    const barcodeTextHeight = 9; // Approx height for fontSize 9
    const qrTextHeight = 7;      // Approx height for fontSize 7
    const textSpacing = 5;       // Space between image and text

    const barcodeBlockHeight = barcodeHeight + textSpacing + barcodeTextHeight;
    const qrBlockHeight = qrCodeVisualSize + textSpacing + qrTextHeight;

    const blockHeight = Math.max(barcodeBlockHeight, qrBlockHeight);
    const startY = (cardHeight - blockHeight) / 2;
    
    // Barcode (centered within its allocated width)
    const barcodeX = startX;
    doc.image(barcodeBuffer, barcodeX, startY, { width: barcodeVisualWidth, height: barcodeHeight });
    doc.fillColor(textColor)
       .fontSize(9)
       .text(barcode, barcodeX, startY + barcodeHeight + textSpacing, { width: barcodeVisualWidth, align: 'center' });

    // QR Code (next to barcode, within its allocated width)
    const qrCodeX = startX + barcodeVisualWidth + gap; // Small gap between barcode and QR code
    doc.image(qrCodeBuffer, qrCodeX, startY, { width: qrCodeVisualSize, height: qrCodeVisualSize });
    doc.fillColor(textColor)
       .fontSize(7)
       .text('Scan to View Profile', qrCodeX, startY + qrCodeVisualSize + textSpacing, { width: qrCodeVisualSize, align: 'center' });
    
  // Footer Text (optional, can be gym name or website)
  
  doc.restore();
};

/**
 * Draw the front side of the membership card onto an existing PDFDocument (for page composition, not buffer insertion)
 * @param {PDFDocument} doc
 * @param {Object} user
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Object} [customFrontStyle]
 */
const drawCardFrontOnDoc = async (doc, user, x, y, width, height, customFrontStyle) => {
  // Fetch style (prefer passed style, fallback to DB)
  let frontStyle = customFrontStyle;
  if (!frontStyle) {
    const settings = await getGymSettingsService();
    frontStyle = settings?.membershipCardFront || {};
  }
  const backgroundOpacity = typeof frontStyle.backgroundOpacity === 'number' ? frontStyle.backgroundOpacity : 1; // New: Default to 1
  doc.save();
  doc.translate(x, y);
  // خلفية الكارت
  doc.rect(0, 0, width, height)
    .fill(frontStyle.backgroundColor || '#fff');
  // صورة الخلفية
  // if (frontStyle.backgroundImage) {
  //   try {
  //     const res = await fetch(frontStyle.backgroundImage);
  //     if (!res.ok) {
  //       console.error(`Error: Failed to fetch background image from ${frontStyle.backgroundImage}. Status: ${res.status}`);
  //       return; // Stop processing this image
  //     }
  //     const imageArrayBuffer = await res.arrayBuffer();
  //     const imageBuffer = Buffer.from(imageArrayBuffer);
      
  //     // Draw the image first
  //     doc.image(imageBuffer, 0, 0, {
  //       width, height
  //     });

  //     // Then draw a semi-transparent rectangle over it to simulate opacity
  //     doc.save(); // Save current state
  //     doc.fillOpacity(1 - backgroundOpacity); // Inverse opacity for the fill color
  //     doc.fillColor(frontStyle.backgroundColor || '#fff'); // Use the background color
  //     doc.rect(0, 0, width, height).fill();
  //     doc.restore(); // Restore state
  //   }
  //   catch {}
  // }


// صورة الخلفية (بنفس أبعاد الكارت 400x250)
if (frontStyle.backgroundImage) {
  try {
    const res = await fetch(frontStyle.backgroundImage);
    if (!res.ok) {
      console.error(`Error: Failed to fetch background image from ${frontStyle.backgroundImage}. Status: ${res.status}`);
      return; // Stop processing this image
    }

    const imageArrayBuffer = await res.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    // ✅ ارسم خلفية الكارت بنفس المقاس الثابت
    const cardWidth = 400;
    const cardHeight = 250;

    // Draw the image first (تملى الكارت بالكامل)
    doc.image(imageBuffer, 0, 0, {
      width: cardWidth,
      height: cardHeight,
    });

    // ثم نضيف طبقة شفافة لمحاكاة الـ opacity
    doc.save();
    doc.fillOpacity(1 - (frontStyle.backgroundOpacity ?? 1)); // لو undefined، خليها 1
    doc.fillColor(frontStyle.backgroundColor || '#fff');
    doc.rect(0, 0, cardWidth, cardHeight).fill();
    doc.restore();
  } catch (e) {
    console.error('Error loading background image:', e);
  }
}



  // الباترين
  if (frontStyle.patternImage) {
    try {
      const res = await fetch(frontStyle.patternImage);
      if (res.ok) {
        const patternArrayBuffer = await res.arrayBuffer();
        const patternBuffer = Buffer.from(patternArrayBuffer);
        doc.save();
        if (frontStyle.patternOpacity >= 0) {
          doc.fillColor(`rgba(255,255,255,${Number(frontStyle.patternOpacity)})`);
          doc.rect(0,0,width,height).fill();
        }
        doc.image(patternBuffer, 0, 0, { width, height, fit: [width, height] });
        doc.restore();
      }
    } catch {}
  }
  // اللوجو في الوسط
  if (frontStyle.centerLogoUrl) {
    try {
      const res = await fetch(frontStyle.centerLogoUrl);
      if (res.ok) {
        const logoArrayBuffer = await res.arrayBuffer();
        const logoBuffer = Buffer.from(logoArrayBuffer);
        const logoW = frontStyle.centerLogoWidth || 120;
        const logoH = frontStyle.centerLogoHeight || 120;
        const logoX = (width - logoW) / 2;
        const logoY = (height - logoH) / 2;
        doc.image(logoBuffer, logoX, logoY, { width: logoW, height: logoH, fit: [logoW, logoH] });
      }
    } catch {}
  }
  // لا نرسم أي بوردر/إطار نهائياً
  
  // Add optional phone and address if enabled and present
  if (frontStyle.showContactInfo) {
    doc.fillColor(frontStyle.contactInfoColor || '#333333');
    doc.fontSize(frontStyle.contactInfoFontSize || 8);
    let contactY = 220; // Position near bottom

    const settings = await getGymSettingsService();
    // Use settings.phone and settings.address instead of user.phone and user.address
    if (settings.phone) {
      doc.text(`Phone: ${settings.phone}`, 20, contactY);
      contactY += (frontStyle.contactInfoLineHeight || 10);
    }
    if (settings.address) {
      doc.text(`Address: ${settings.address}`, 20, contactY);
    }
  }

  doc.restore();
};

/**
 * Generate a combined PDF containing multiple membership cards laid out in a grid
 * @param {Array<string>} userIds
 * @returns {Promise<{buffer: Buffer, fileName: string, totalCards: number}>}
 */
export const generateCombinedCardsPDF = async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } }).lean();
  if (!users || users.length === 0) {
    throw new Error('No users found for combined PDF');
  }
  const settings = await getGymSettingsService();
  const frontStyle = settings?.membershipCardFront || {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `membership_cards_combined_${users.length}_${timestamp}.pdf`;
  const doc = new PDFDocument({ size: [400, 250], margin: 0 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  let pageCount = 0;
  // إذا فيه front design، ارسم الوجه مباشرة على الصفحة الأولى بدون addPage
  if (frontStyle.showFrontDesign) {
    await drawCardFrontOnDoc(doc, users[0], 0, 0, 400, 250, frontStyle);
    pageCount++;
  }
  // يرسم ظهر كل كارت مع addPage إلا لو كانت الصفحة الأولى بدون front
  for(let i = 0; i < users.length; i++) {
    if (i > 0 || frontStyle.showFrontDesign) doc.addPage();
    await drawMembershipCardOnDoc(doc, users[i], 0, 0, 400, 250);
    pageCount++;
  }
  doc.end();
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve({ buffer, fileName, totalCards: users.length });
    });
    doc.on('error', reject);
  });
};

/**
 * Generate combined PDF for all active members
 */
export const generateCombinedAllMembersPDF = async () => {
  const members = await User.find({ 
    role: 'member', 
    status: 'active'
  }).select('_id');
  const ids = members.map(m => m._id.toString());
  return generateCombinedCardsPDF(ids);
};

/**
 * Generate double-sided membership card (front + back)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Card generation result
 */
export const generateDoubleSidedCard = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.barcode) {
      try {
        const userCount = await User.countDocuments();
        user.barcode = `G${String(userCount + 1).padStart(4, '0')}`;
        await user.save();
      } catch (err) {
        user.barcode = `G${Date.now().toString().slice(-6)}`;
        await user.save();
      }
    }
    const settings = await getGymSettingsService();
    const frontStyle = settings?.membershipCardFront || {};
    const doc = new PDFDocument({ size: [400, 250], margin: 20 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    // إذا فيه وش فعال نضيفة في الصفحة الأولى
    if (frontStyle.showFrontDesign) {
      await drawCardFrontOnDoc(doc, user, 0, 0, 400, 250, frontStyle);
      doc.addPage();
    }
    // الخلف دومًا
    await drawMembershipCardOnDoc(doc, user, 0, 0, 400, 250);
    doc.end();
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          success: true,
          message: 'Double-sided membership card generated successfully',
          fileName: `membership_card_double_${user.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          buffer,
          user: {
            id: user._id,
            name: user.name,
            barcode: user.barcode,
            email: user.email,
          }
        });
      });
      doc.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Double-sided card generation failed: ${error.message}`);
  }
};

/**
 * Generate membership card for a single user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Card generation result
 */
export const generateSingleCard = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate barcode if user doesn't have one
    if (!user.barcode) {
      try {
        const userCount = await User.countDocuments();
        user.barcode = `G${String(userCount + 1).padStart(4, '0')}`;
        await user.save();
      } catch (err) {
        user.barcode = `G${Date.now().toString().slice(-6)}`;
        await user.save();
      }
    }

    const { buffer, fileName } = await generateMembershipCardPDF(user);

    return {
      success: true,
      message: 'Membership card generated successfully',
      fileName,
      buffer,
      user: {
        id: user._id,
        name: user.name,
        barcode: user.barcode,
        email: user.email
      }
    };
  } catch (error) {
    throw new Error(`Card generation failed: ${error.message}`);
  }
};

/**
 * Generate membership cards for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Object>} Batch generation result
 */
export const generateBatchCards = async (userIds) => {
  try {
    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        const result = await generateSingleCard(userId);
        results.push(result);
      } catch (error) {
        errors.push({
          userId,
          error: error.message
        });
      }
    }

    return {
      success: true,
      message: `Generated ${results.length} cards successfully`,
      results,
      errors,
      totalRequested: userIds.length,
      totalGenerated: results.length,
      totalErrors: errors.length
    };
  } catch (error) {
    throw new Error(`Batch card generation failed: ${error.message}`);
  }
};

/**
 * Generate membership cards for all active members
 * @returns {Promise<Object>} Batch generation result
 */
export const generateAllMemberCards = async () => {
  try {
    const members = await User.find({ 
      role: 'member', 
      status: 'active'
    });

    if (members.length === 0) {
      return {
        success: true,
        message: 'No active members found',
        results: [],
        errors: [],
        totalRequested: 0,
        totalGenerated: 0,
        totalErrors: 0
      };
    }

    const userIds = members.map(member => member._id.toString());
    return await generateBatchCards(userIds);
  } catch (error) {
    throw new Error(`Generate all cards failed: ${error.message}`);
  }
};

/**
 * Get user by barcode for attendance scanning
 * @param {string} barcode - User's barcode
 * @returns {Promise<Object>} User object
 */
export const getUserByBarcode = async (barcode) => {
  try {
    const user = await User.findOne({ barcode, status: 'active' });
    if (!user) {
      throw new Error('User not found or inactive');
    }
    return user;
  } catch (error) {
    throw new Error(`User lookup failed: ${error.message}`);
  }
};

/**
 * Generate sequential membership cards
 * @param {string} prefix - Barcode prefix (e.g., 'G')
 * @param {number} start - Starting number for the sequence
 * @param {number} count - Number of cards to generate
 * @returns {Promise<Object>} Batch generation result including details for each card
 */
export const generateSequentialCards = async (prefix, start, count) => {
  const results = [];
  const errors = [];

  // Temporary array to hold mock users for combined PDF generation
  const mockUsersForCombinedPdf = [];

  for (let i = 0; i < count; i++) {
    const currentNumber = start + i;
    const barcode = `${prefix}${String(currentNumber).padStart(4, '0')}`;

    try {
      // Check if a user with this barcode already exists
      let user = await User.findOne({ barcode });

      if (user) {
        errors.push({ barcode, error: 'Barcode already exists for another user.' });
        continue;
      }

      // Create a mock user object for card generation
      // This object contains only the necessary fields for PDF generation
      // and will NOT be saved to the database.
      const mockUser = {
        _id: `mockId_${barcode}`, // A unique identifier for the mock user
        name: `Sequential Card ${barcode}`,
        email: `sequential.${barcode.toLowerCase()}@example.com`,
        barcode: barcode,
        membershipLevel: 'N/A', // Placeholder
        subscriptionEndDate: new Date(), // Placeholder
        phone: 'N/A', // Placeholder
        address: 'N/A', // Placeholder
      };

      const { buffer, fileName } = await generateMembershipCardPDF(mockUser);
      results.push({ barcode, success: true, fileName, filePath: `/cards/${fileName}` });
      
      // Add mock user to the array for combined PDF generation
      mockUsersForCombinedPdf.push(mockUser);

    } catch (error) {
      console.error(`Error generating card for barcode ${barcode}:`, error);
      errors.push({ barcode, error: error.message });
    }
  }

  let combinedPdfBuffer = null;
  let combinedPdfFileName = '';

  if (mockUsersForCombinedPdf.length > 0) {
    try {
      // Pass the array of mock users to generateCombinedCardsPDF
      const combinedPdfResult = await generateCombinedCardsPDFWithMockUsers(mockUsersForCombinedPdf);
      combinedPdfBuffer = combinedPdfResult.buffer;
      combinedPdfFileName = combinedPdfResult.fileName;
    } catch (pdfError) {
      console.error('Error generating combined PDF for sequential cards:', pdfError);
      errors.push({ barcode: 'N/A', error: `Failed to generate combined PDF: ${pdfError.message}` });
    }
  }

  return {
    success: errors.length === 0,
    message: errors.length === 0 ? `Successfully generated ${results.length} cards.` : `Generated ${results.length} cards with ${errors.length} errors.`, 
    data: {
      results: results.map(r => ({
        success: r.success,
        message: 'Card generated',
        fileName: r.fileName,
        filePath: r.filePath,
        user: {
          id: r.userId || '', // Empty string as userId is not applicable for mock users
          name: r.barcode, // Use barcode as name for mock users
          barcode: r.barcode,
          email: `${r.barcode.toLowerCase()}@example.com` // Placeholder email
        }
      })),
      errors,
      totalRequested: count,
      totalGenerated: results.length,
      totalErrors: errors.length,
      combinedPdfBuffer: combinedPdfBuffer ? combinedPdfBuffer.toString('base64') : null, // Convert buffer to base64 string
      combinedPdfFileName: combinedPdfFileName,
    },
  };
};

/**
 * Generate a combined PDF containing multiple membership cards laid out in a grid using mock user objects
 * This function is specifically for sequential card generation where no actual users are created.
 * @param {Array<Object>} mockUsers - Array of mock user objects (at least _id, name, barcode)
 * @returns {Promise<{buffer: Buffer, fileName: string, totalCards: number}>}
 */
const generateCombinedCardsPDFWithMockUsers = async (mockUsers) => {
  const settings = await getGymSettingsService();
  const frontStyle = settings?.membershipCardFront || {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `membership_cards_combined_${mockUsers.length}_${timestamp}.pdf`;
  const doc = new PDFDocument({ size: [400, 250], margin: 0 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  let pageCount = 0;
  
  if (frontStyle.showFrontDesign) {
    await drawCardFrontOnDoc(doc, mockUsers[0], 0, 0, 400, 250, frontStyle);
    pageCount++;
  }

  for(let i = 0; i < mockUsers.length; i++) {
    if (i > 0 || frontStyle.showFrontDesign) doc.addPage();
    await drawMembershipCardOnDoc(doc, mockUsers[i], 0, 0, 400, 250);
    pageCount++;
  }
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve({ buffer, fileName, totalCards: mockUsers.length });
    });
    doc.on('error', reject);
  });
};

/**
 * Get list of generated cards
 * @returns {Promise<Array>} List of card files
 */
export const getGeneratedCards = async () => {
  try {
    // In production environments like Vercel, we can't access local files
    // Return empty array or implement alternative storage solution
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // Only for development/local environments
    const cardsDir = path.join(__dirname, '../../cards');
    if (fs.existsSync(cardsDir)) {
      const files = fs.readdirSync(cardsDir);
      const cardFiles = files
        .filter(file => file.endsWith('.pdf'))
        .map(file => ({
          fileName: file,
          filePath: path.join(cardsDir, file),
          size: fs.statSync(path.join(cardsDir, file)).size,
          created: fs.statSync(path.join(cardsDir, file)).birthtime
        }))
        .sort((a, b) => b.created - a.created);

      return cardFiles;
    }
    
    return [];
  } catch (error) {
    // In production, return empty array instead of throwing error
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    throw new Error(`Failed to get card list: ${error.message}`);
  }
};