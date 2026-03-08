import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema(
  {
    // البيانات الأساسية
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "trainer", "member", "manager", "accountant", "super_admin"], default: "member" },
    phone: { type: String, trim: true, match: /^[0-9]{10,15}$/, required: true, default: null, unique: true, sparse: true },
    dob: { type: Date },
    avatarUrl: { type: String, default: "" },
    address: { type: String, default: "" },
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive", "banned" , "present"], default: "active" },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    metadata: {
      emergencyContact: { type: String, default: "" },
      notes: { type: String, default: "" },
      lastLogin: { type: Date },
      ipAddress: { type: String },
    },
    isDeleted: { type: Boolean, default: false },

    // بيانات الاشتراك والعضوية
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    subscriptionFreezeDays: { type: Number, default: 0 },
    subscriptionFreezeUsed: { type: Number, default: 0 },
    subscriptionStatus: { type: String, enum: ["active", "frozen", "expired", "cancelled"], default: "active" },
    subscriptionRenewalReminderSent: { type: Date },
    lastPaymentDate: { type: Date },
    nextPaymentDueDate: { type: Date },

    loyaltyPoints: { type: Number, default: 100 },
    membershipLevel: { type: String, enum: ["basic", "silver", "gold", "platinum"], default: "basic" },

    // Barcode للعضوية
    barcode: { type: String, unique: true, sparse: true },

    goals: {
      weightLoss: { type: Boolean, default: false },
      muscleGain: { type: Boolean, default: false },
      endurance: { type: Boolean, default: false },
    },

    // بيانات الجيم
    heightCm: { type: Number },
    baselineWeightKg: { type: Number },
    targetWeightKg: { type: Number },
    activityLevel: { type: String, enum: ["sedentary", "light", "moderate", "active", "very_active"] },
    healthNotes: { type: String, default: "" },

    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // مدرب المستخدم
  },
  { timestamps: true }
);

// ================== Virtuals ==================
// حساب العمر من dob
userSchema.virtual("age").get(function () {
  if (!this.dob) return undefined;
  const diff = Date.now() - new Date(this.dob).getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// ================== Pre-save Hooks ==================
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ================== Methods ==================
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ================== Indexes ==================
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ trainerId: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ barcode: 1 }, { unique: true, sparse: true });

const User = mongoose.model("User", userSchema);

export default User;
