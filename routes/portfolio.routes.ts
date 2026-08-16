import { Router } from 'express';
import {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioAiAnalysis,
  getRebalanceRecommendations,
  generatePortfolioReport,
  addAssetToPortfolio,
  removeAssetFromPortfolio,
} from '../controllers/portfolio.controller';

const router = Router();

/**
 * @route   GET /api/portfolios
 * @desc    Get all portfolios with Gemini-generated market exposure summaries
 * @access  Private
 */
router.get('/', getPortfolios);

/**
 * @route   POST /api/portfolios
 * @desc    Create a new portfolio with initial Gemini risk & asset distribution analysis
 * @access  Private
 */
router.post('/', createPortfolio);

/**
 * @route   GET /api/portfolios/:id
 * @desc    Get portfolio details with real-time Gemini health evaluation
 * @access  Private
 */
router.get('/:id', getPortfolioById);

/**
 * @route   PUT /api/portfolios/:id
 * @desc    Update portfolio parameters and re-evaluate risk profile using Gemini
 * @access  Private
 */
router.put('/:id', updatePortfolio);

/**
 * @route   DELETE /api/portfolios/:id
 * @desc    Delete a portfolio and generate AI exit analysis summary
 * @access  Private
 */
router.delete('/:id', deletePortfolio);

/**
 * @route   POST /api/portfolios/:id/analyze
 * @desc    Trigger deep Gemini AI analysis (sentiment, risk, diversification score)
 * @access  Private
 */
router.post('/:id/analyze', getPortfolioAiAnalysis);

/**
 * @route   POST /api/portfolios/:id/rebalance
 * @desc    Fetch Gemini-powered AI rebalancing recommendations and trade actions
 * @access  Private
 */
router.post('/:id/rebalance', getRebalanceRecommendations);

/**
 * @route   POST /api/portfolios/:id/report
 * @desc    Generate a comprehensive Gemini AI executive summary report
 * @access  Private
 */
router.post('/:id/report', generatePortfolioReport);

/**
 * @route   POST /api/portfolios/:id/assets
 * @desc    Add asset to portfolio and perform Gemini impact assessment
 * @access  Private
 */
router.post('/:id/assets', addAssetToPortfolio);

/**
 * @route   DELETE /api/portfolios/:id/assets/:assetId
 * @desc    Remove asset from portfolio and calculate new post-removal AI forecast
 * @access  Private
 */
router.delete('/:id/assets/:assetId', removeAssetFromPortfolio);

export default router;