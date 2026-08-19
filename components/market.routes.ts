

// --- CONSOLIDATED FROM: ./routes/market.routes.ts ---

import { Router } from 'express';
import {
  getMarketOverview,
  getAssetAnalysis,
  getMarketSentiment,
  predictPriceMovement,
  getTrendingAssets,
  compareAssets
} from '../controllers/market.controller';

const router = Router();

/**
 * @route   GET /api/market/overview
 * @desc    Get AI-generated market overview and key macro insights
 * @access  Public
 */
router.get('/overview', getMarketOverview);

/**
 * @route   GET /api/market/trending
 * @desc    Get AI-identified trending assets and market movers
 * @access  Public
 */
router.get('/trending', getTrendingAssets);

/**
 * @route   GET /api/market/sentiment
 * @desc    Get overall market sentiment analysis synthesized by Gemini
 * @access  Public
 */
router.get('/sentiment', getMarketSentiment);

/**
 * @route   GET /api/market/analysis/:symbol
 * @desc    Get comprehensive Gemini AI analysis for a specific asset symbol
 * @access  Public
 */
router.get('/analysis/:symbol', getAssetAnalysis);

/**
 * @route   GET /api/market/predict/:symbol
 * @desc    Get AI-driven scenario predictions and technical outlook for a symbol
 * @access  Public
 */
router.get('/predict/:symbol', predictPriceMovement);

/**
 * @route   POST /api/market/compare
 * @desc    Compare multiple assets using Gemini multi-asset intelligence
 * @access  Public
 */
router.post('/compare', compareAssets);

export default router;