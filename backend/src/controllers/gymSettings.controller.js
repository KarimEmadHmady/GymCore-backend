import { getGymSettingsService, upsertGymSettingsService } from '../services/gymSettings.service.js';

export const getGymSettings = async (req, res) => {
  try {
    const settings = await getGymSettingsService();
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGymSettings = async (req, res) => {
  try {
    let data = { ...req.body };
    
    // Parse JSON strings for individual fields
    const parsedData = {};
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string' && key !== 'logoUrl') {
        try {
          parsedData[key] = JSON.parse(data[key]);
        } catch (e) {
          parsedData[key] = data[key]; // Keep as string if not valid JSON
        }
      } else {
        parsedData[key] = data[key];
      }
    });
    data = parsedData;
    
    const allowedMembershipCardStyleFields = ['backgroundColor', 'textColor', 'accentColor', 'backgroundImage', 'backgroundOpacity'];
    if (data.membershipCardStyle) {
      data.membershipCardStyle = Object.keys(data.membershipCardStyle)
        .filter(key => allowedMembershipCardStyleFields.includes(key))
        .reduce((obj, key) => { obj[key] = data.membershipCardStyle[key]; return obj; }, {});
    }

    const allowedMembershipCardFrontFields = [
      'backgroundColor', 'backgroundImage', 'patternImage', 'patternOpacity',
      'centerLogoUrl', 'centerLogoWidth', 'centerLogoHeight', 'showFrontDesign',
      'showContactInfo', 'contactInfoColor', 'contactInfoFontSize', 'contactInfoLineHeight'
    ];
    if (data.membershipCardFront) {
      data.membershipCardFront = Object.keys(data.membershipCardFront)
        .filter(key => allowedMembershipCardFrontFields.includes(key))
        .reduce((obj, key) => {
          if (key === 'showFrontDesign' || key === 'showContactInfo') {
            obj[key] = data.membershipCardFront[key] === 'true'; // Convert to boolean
          } else if (key === 'contactInfoFontSize' || key === 'contactInfoLineHeight') {
            obj[key] = Number(data.membershipCardFront[key]); // Convert to number
          } else {
            obj[key] = data.membershipCardFront[key];
          }
          return obj; 
        }, {});
    }

    // لو جاء رفع صورة logoUrl
    if (req.files?.logoUrl && req.files.logoUrl[0]?.path) {
      // هذا شعار الجيم الرئيسي (من AdminSettings)
      data.logoUrl = req.files.logoUrl[0].path;
    }
    if (req.files?.membershipCardBackgroundImage && req.files.membershipCardBackgroundImage[0]?.path) {
      data.membershipCardStyle = data.membershipCardStyle || {};
      data.membershipCardStyle.backgroundImage = req.files.membershipCardBackgroundImage[0].path;
    }
    if (req.files?.backgroundImage && req.files.backgroundImage[0]?.path) {
      data.membershipCardFront = data.membershipCardFront || {};
      data.membershipCardFront.backgroundImage = req.files.backgroundImage[0].path;
    }
    if (req.files?.patternImage && req.files.patternImage[0]?.path) {
      data.membershipCardFront = data.membershipCardFront || {};
      data.membershipCardFront.patternImage = req.files.patternImage[0].path;
    }
    if (req.files?.centerLogoUrl && req.files.centerLogoUrl[0]?.path) {
      data.membershipCardFront = data.membershipCardFront || {};
      data.membershipCardFront.centerLogoUrl = req.files.centerLogoUrl[0].path;
    }
    
   
    // الآن سلّم كل الداتا للخدمة
    const updated = await upsertGymSettingsService(data);
    res.status(200).json({ message: 'Gym settings updated successfully', settings: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const uploadGymSettingsImageHandler = async (req, res) => {
  if (!req.file?.path || !req.file?.filename) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  res.json({ url: req.file.path, publicId: req.file.filename });
};