

// --- CONSOLIDATED FROM: ./controllers/client.controller.ts ---

import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini AI SDK using the mandatory environment variable setup
const ai = new GoogleGenAI({});

/**
 * Controller for handling Client-related operations, enriched with Gemini AI capabilities
 * across every endpoint.
 */
export class ClientController {

  /**
   * POST /api/clients/support
   * Handles client support queries by providing automated, intelligent support responses.
   */
  public static async handleSupportTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientName, issueDescription, conversationHistory, urgency } = req.body;

      if (!issueDescription) {
        res.status(400).json({ error: 'issueDescription is required.' });
        return;
      }

      const prompt = `
You are an expert, empathetic, and highly efficient AI Customer Support Specialist for an enterprise platform.

Client Name: ${clientName || 'Valued Client'}
Reported Urgency: ${urgency || 'Normal'}

Previous Conversation History:
${conversationHistory ? JSON.stringify(conversationHistory, null, 2) : 'No prior history provided.'}

Current Issue Description:
${issueDescription}

Provide a structured response containing:
1. An empathetic and professional direct reply to the client.
2. Suggested troubleshooting steps or resolution actions.
3. Internal agent notes summarizing the core issue and recommended priority escalation if necessary.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              clientResponse: { type: 'STRING', description: 'The reply message to send directly to the client.' },
              recommendedSteps: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Actionable steps for the client or support team.'
              },
              internalNotes: { type: 'STRING', description: 'Summary notes for human agents.' },
              escalationRequired: { type: 'BOOLEAN', description: 'Whether human intervention is required.' }
            },
            required: ['clientResponse', 'recommendedSteps', 'internalNotes', 'escalationRequired']
          }
        }
      });

      const result = response.text ? JSON.parse(response.text) : {};

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients/advice
   * Generates tailored, data-driven strategic advice for a client based on their profile and goals.
   */
  public static async getPersonalizedAdvice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId, industry, currentGoals, metrics, painPoints } = req.body;

      if (!industry || !currentGoals) {
        res.status(400).json({ error: 'industry and currentGoals are required.' });
        return;
      }

      const prompt = `
You are a senior strategic business advisor. Analyze the client profile below and generate high-impact, personalized strategic recommendations.

Client ID: ${clientId || 'N/A'}
Industry: ${industry}
Current Goals: ${Array.isArray(currentGoals) ? currentGoals.join(', ') : currentGoals}
Key Pain Points: ${painPoints || 'None specified'}
Metrics & Performance Data: ${metrics ? JSON.stringify(metrics, null, 2) : 'Not provided'}

Provide tailored, actionable recommendations to accelerate goal achievement, mitigate pain points, and drive growth.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              executiveSummary: { type: 'STRING' },
              strategicAdvice: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    title: { type: 'STRING' },
                    category: { type: 'STRING' },
                    recommendation: { type: 'STRING' },
                    impact: { type: 'STRING', enum: ['HIGH', 'MEDIUM', 'LOW'] },
                    timeframe: { type: 'STRING' }
                  },
                  required: ['title', 'category', 'recommendation', 'impact', 'timeframe']
                }
              },
              riskFactors: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              }
            },
            required: ['executiveSummary', 'strategicAdvice', 'riskFactors']
          }
        }
      });

      const advice = response.text ? JSON.parse(response.text) : {};

      res.status(200).json({
        success: true,
        data: advice
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients/draft-communication
   * Crafts tailored communications (emails, follow-ups, contract renewals, status updates).
   */
  public static async draftCommunication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientName, communicationType, tone, keyPoints, callToAction, senderName } = req.body;

      if (!communicationType || !keyPoints) {
        res.status(400).json({ error: 'communicationType and keyPoints are required.' });
        return;
      }

      const prompt = `
Draft a polished client communication message based on the following parameters:

Recipient Client: ${clientName || 'Valued Client'}
Type of Communication: ${communicationType} (e.g., Email, Meeting Follow-up, Account Update, Renewal Notice)
Desired Tone: ${tone || 'Professional, warm, and concise'}
Sender Name/Title: ${senderName || 'Account Management Team'}
Call To Action: ${callToAction || 'Schedule a sync call'}

Key Points to Cover:
${Array.isArray(keyPoints) ? keyPoints.map(p => `- ${p}`).join('\n') : keyPoints}

Ensure the message is engaging, clear, and perfectly formatted.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              subjectLine: { type: 'STRING' },
              body: { type: 'STRING' },
              callToActionText: { type: 'STRING' },
              suggestedSendTime: { type: 'STRING' }
            },
            required: ['subjectLine', 'body', 'callToActionText']
          }
        }
      });

      const draft = response.text ? JSON.parse(response.text) : {};

      res.status(200).json({
        success: true,
        data: draft
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients/analyze-feedback
   * Processes qualitative feedback from clients, identifying sentiment, key themes, and action items.
   */
  public static async analyzeFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientFeedback, context } = req.body;

      if (!clientFeedback) {
        res.status(400).json({ error: 'clientFeedback is required.' });
        return;
      }

      const prompt = `
Analyze the following client feedback and perform sentiment analysis, topic identification, and action item extraction.

Context: ${context || 'General Client Feedback'}
Feedback text:
"${clientFeedback}"
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              sentimentScore: { type: 'NUMBER', description: 'Score between -1.0 (very negative) and 1.0 (very positive)' },
              sentimentLabel: { type: 'STRING', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'] },
              keyThemes: { type: 'ARRAY', items: { type: 'STRING' } },
              churnRiskScore: { type: 'NUMBER', description: 'Score between 0.0 (no risk) and 1.0 (critical risk)' },
              actionableTasks: { type: 'ARRAY', items: { type: 'STRING' } },
              summary: { type: 'STRING' }
            },
            required: ['sentimentScore', 'sentimentLabel', 'keyThemes', 'churnRiskScore', 'actionableTasks', 'summary']
          }
        }
      });

      const analysis = response.text ? JSON.parse(response.text) : {};

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients/summary
   * Synthesizes extensive client activity notes into a comprehensive executive briefing note.
   */
  public static async generateClientSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientProfile, interactionHistory, openTickets, revenueData } = req.body;

      if (!clientProfile) {
        res.status(400).json({ error: 'clientProfile details are required.' });
        return;
      }

      const prompt = `
Synthesize the following comprehensive client data into an executive summary briefing for account management leadership.

Client Profile: ${JSON.stringify(clientProfile, null, 2)}
Recent Interactions: ${JSON.stringify(interactionHistory || [], null, 2)}
Open Tickets: ${JSON.stringify(openTickets || [], null, 2)}
Financial/Revenue Data: ${JSON.stringify(revenueData || {}, null, 2)}

Produce a concise executive summary highlighting account health, key growth opportunities, active risks, and immediate management actions.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              accountHealthStatus: { type: 'STRING', enum: ['EXCELLENT', 'STABLE', 'AT_RISK', 'CRITICAL'] },
              briefingOverview: { type: 'STRING' },
              keyAchievements: { type: 'ARRAY', items: { type: 'STRING' } },
              upsellOpportunities: { type: 'ARRAY', items: { type: 'STRING' } },
              immediateActionItems: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['accountHealthStatus', 'briefingOverview', 'keyAchievements', 'upsellOpportunities', 'immediateActionItems']
          }
        }
      });

      const summary = response.text ? JSON.parse(response.text) : {};

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
}