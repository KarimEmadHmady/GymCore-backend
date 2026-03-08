import {
  generateSingleCard,
  generateBatchCards,
  generateAllMemberCards,
  getGeneratedCards,
  generateCombinedCardsPDF,
  generateCombinedAllMembersPDF,
  generateDoubleSidedCard,
  generateSequentialCards
} from '../services/membershipCard.service.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Generate membership card for a single user
 */
export const generateUserCard = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await generateSingleCard(userId);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('Content-Length', result.buffer.length);
    
    // Send PDF buffer directly
    res.send(result.buffer);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Generate membership cards for multiple users
 */
export const generateBatchCardsController = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const result = await generateBatchCards(userIds);
    
    res.status(200).json({
      success: true,
      message: 'Batch card generation completed',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Generate membership cards for all active members
 */
export const generateAllMemberCardsController = async (req, res) => {
  try {
    const result = await generateAllMemberCards();
    
    res.status(200).json({
      success: true,
      message: 'All member cards generation completed',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get list of generated cards
 */
export const getGeneratedCardsController = async (req, res) => {
  try {
    const cards = await getGeneratedCards();
    
    res.status(200).json({
      success: true,
      message: 'Generated cards retrieved successfully',
      data: cards
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Download a specific membership card
 */
export const downloadCard = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // In production, we can't access local files
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({
        success: false,
        message: 'Card file not available in production environment'
      });
    }
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const cardsDir = path.join(__dirname, '../../cards');
    const filePath = path.join(cardsDir, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Card file not found'
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Generate a combined PDF for specified user IDs and return it as a downloadable file
 */
export const downloadCombinedCards = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'User IDs array is required' });
    }
    const { buffer, fileName } = await generateCombinedCardsPDF(userIds);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Generate a combined PDF for all active members
 */
export const downloadCombinedCardsAll = async (req, res) => {
  try {
    const { buffer, fileName } = await generateCombinedAllMembersPDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Generate double-sided membership card for a single user
 */
export const generateDoubleSidedUserCard = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await generateDoubleSidedCard(userId);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('Content-Length', result.buffer.length);
    
    // Send PDF buffer directly
    res.send(result.buffer);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Generate sequential membership cards
 */
export const generateSequentialCardsController = async (req, res) => {
  try {
    const { prefix, start, count } = req.body;

    if (!prefix || typeof prefix !== 'string') {
      return res.status(400).json({ success: false, message: 'Prefix is required and must be a string.' });
    }
    if (typeof start !== 'number' || start <= 0) {
      return res.status(400).json({ success: false, message: 'Start number is required and must be a positive number.' });
    }
    if (typeof count !== 'number' || count <= 0) {
      return res.status(400).json({ success: false, message: 'Count is required and must be a positive number.' });
    }

    const result = await generateSequentialCards(prefix, start, count);

    res.status(200).json({
      success: true,
      message: 'Sequential card generation completed',
      data: result.data, // Corrected: send result.data instead of the whole result object
    });
  } catch (error) {
    console.error('Error in generateSequentialCardsController:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate sequential cards.' });
  }
};

