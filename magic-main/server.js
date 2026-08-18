import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv'; // Import dotenv to load environment variables

// ==========================================
// 1. Environment Setup & Configuration
// ==========================================
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7860;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 2. Middleware Configuration
// ==========================================
// Parse JSON request bodies
app.use(express.json());

// Authorization middleware (Auth0 JWT Check)
const jwtCheck = auth({
  audience: 'https://aibankinguniversity.us.auth0.com/api/v2/', // Updated to standard Auth0 audience or your specific API identifier
  issuerBaseURL: 'https://aibankinguniversity.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// Enforce JWT check on all /api routes
app.use('/api', jwtCheck);

// ==========================================
// 3. API Routes
// ==========================================

// Route: GET /api/authorized
// Description: A simple protected endpoint to verify authentication.
app.get('/api/authorized', (req, res) => {
    res.json({ message: 'Secured Resource Accessed Successfully' });
});

// Route: POST /api/gemini-chat
// Description: Endpoint to handle chat messages and interact with the Gemini API.
// Note: Currently uses placeholder logic for Gemini API interaction.
app.post('/api/gemini-chat', jwtCheck, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required in the request body.' });
    }

    // Placeholder for Gemini API Key (should be loaded from environment variables)
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables.');
      // In a real application, you might not expose this error directly to the client
      return res.status(500).json({ error: 'Server configuration error: Gemini API key missing.' });
    }

    console.log(`Received message for Gemini chat: "${message}"`);

    // --- Placeholder for actual Gemini API integration ---
    // In a real scenario, you would import and use the Gemini SDK or make an HTTP request here.
    // Example using a hypothetical Gemini SDK:
    // import { GoogleGenerativeAI } from '@google/generative-ai';
    // const genAI = new GoogleGenerativeAI(geminiApiKey);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const result = await model.generateContent(message);
    // const response = await result.response;
    // const text = response.text();
    // res.json({ reply: text });
    // ---------------------------------------------------

    // Simulate a delay and a response from Gemini
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency

    const simulatedGeminiResponse = `This is a simulated response to your message: "${message}". (Gemini API integration pending)`;

    res.json({ reply: simulatedGeminiResponse });

  } catch (error) {
    console.error('Error in /api/gemini-chat:', error);
    res.status(500).json({ error: 'Failed to process chat request', details: error.message });
  }
});

// ==========================================
// 4. Static File Serving & SPA Routing
// ==========================================

// Serve static files from the 'dist' directory (frontend build)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html for Single Page Application (SPA) routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ==========================================
// 5. Server Startup
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is running on https://0.0.0.0:${PORT}`);
});