import mongoose from 'mongoose';

const gymSettingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    workingHours: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    membershipPlans: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        durationDays: { type: Number, required: true },
        features: [{ type: String }],
      },
    ],
    paymentSettings: {
      cash: { type: Boolean, default: true },
      card: { type: Boolean, default: false },
      onlineGateway: { type: Boolean, default: false },
      gatewayName: { type: String, default: '' },
    },
    policies: {
      terms: { type: String, default: '' },
      privacy: { type: String, default: '' },
      refund: { type: String, default: '' },
    },
    membershipCardStyle: {
      backgroundColor: { type: String, default: '#f8f9fa' },
      textColor: { type: String, default: '#000000' },
      accentColor: { type: String, default: '#007bff' },
      backgroundImage: { type: String, default: '' }, // Add background image for the back of the card
      backgroundOpacity: { type: Number, default: 1.0 }, // Add background opacity for the back of the card
    },
    membershipCardFront: {
      backgroundColor: { type: String, default: '#ffffff' },
      backgroundImage: { type: String, default: '' },
      patternImage: { type: String, default: '' },
      patternOpacity: { type: Number, default: 0.1 },
      centerLogoUrl: { type: String, default: '' },
      centerLogoWidth: { type: Number, default: 120 },
      centerLogoHeight: { type: Number, default: 120 },
      showFrontDesign: { type: Boolean, default: false },
      showContactInfo: { type: Boolean, default: false }, // New: to control display of contact info
      contactInfoColor: { type: String, default: '#333333' }, // New: color for contact info
      contactInfoFontSize: { type: Number, default: 8 },    // New: font size for contact info
      contactInfoLineHeight: { type: Number, default: 10 }, // New: line height for contact info
    },
  },
  { timestamps: true }
);

// ensure single document usage could be enforced at controller level

const GymSettings = mongoose.model('GymSettings', gymSettingsSchema);
export default GymSettings;
