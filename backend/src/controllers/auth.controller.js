import { registerUser, loginUser } from '../services/auth.service.js';
import { generateToken } from '../utils/jwt.util.js';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = await registerUser(name, email, password, phone);
    res.status(201).json({ message: 'User registered successfully.', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await loginUser(identifier, password);
    const token = generateToken({ id: user._id, role: user.role }, process.env.JWT_SECRET, '10d');
    
    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        address: user.address,
        balance: user.balance,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        subscriptionStatus: user.subscriptionStatus,
        loyaltyPoints: user.loyaltyPoints,
        membershipLevel: user.membershipLevel,
        goals: user.goals,
        trainerId: user.trainerId,
        barcode: user.barcode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(401).json({ message: err.message }); // Changed status to 401 for authentication errors
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      address: user.address,
      balance: user.balance,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionStatus: user.subscriptionStatus,
      loyaltyPoints: user.loyaltyPoints,
      membershipLevel: user.membershipLevel,
      goals: user.goals,
      trainerId: user.trainerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};