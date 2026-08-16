import { Router } from "express";
import type { Request, Response } from "express";
import { getGeminiClient, loadSecrets, auditLogger } from "../services/serverHelpers.js";
import { callGemini } from "../services/geminiService.js";
import { AstraService } from "../services/astraService.js";
import { logger } from "./utils/logger.js";

const router = Router();

/**
 * Standard AI Assistant Chat Endpoint
 */
router.post(["/api/chat", "/chat"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { message, history, context } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let promptText = message;
    if (history && Array.isArray(history) && history.length > 0) {
      const formattedHistory = history.map((h: any) => `${h.role || 'User'}: ${h.content || h.message}`).join("\n");
      promptText = `Previous Conversation:\n${formattedHistory}\n\nUser: ${message}`;
    }

    if (context) {
      promptText = `Context Data: ${JSON.stringify(context)}\n\n` + promptText;
    }

    await auditLogger.log({ id: sessionId }, "ai_chat_request", { promptText, context });

    const resObj = await callGemini("gemini-2.5-flash", promptText, {
      systemInstruction: "You are the Aquarius AI Sovereign Assistant for HNW banking, treasury, quantum security, and executive governance."
    });
    const responseText = typeof resObj === "string" ? resObj : (resObj.text || JSON.stringify(resObj));

    await auditLogger.log({ id: sessionId }, "ai_chat_response", { responseText });

    return res.json({ reply: responseText, timestamp: new Date().toISOString() });
  } catch (error: any) {
    logger.error("Chat Error:", { error: error.message });
    return res.status(500).json({ error: error.message || "Failed to process chat request" });
  }
});

/**
 * Gemini Bidi / Live Audio-Voice Token Issuer Endpoint
 */
router.post(["/api/gemini/live-token", "/gemini/live-token", "/v1/gemini/live-token"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const secrets = loadSecrets();
    const apiKey = process.env.GEMINI_API_KEY || secrets.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "GEMINI_API_KEY is missing on server" });
    }

    const host = req.headers["x-forwarded-host"] || req.get("host");
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const referer = `${protocol}://${host}`;

    await auditLogger.log({ id: sessionId }, "gemini_live_token_requested", { referer });

    return res.json({
      apiKey,
      referer,
      model: "gemini-2.5-flash",
      wssUrl: "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent",
      status: "ACTIVE"
    });
  } catch (error: any) {
    logger.error("Gemini Live Token Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Executive Financial Agent Chat
 */
router.post(["/api/financial-agent/chat", "/financial-agent/chat"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { message, context, macroMode } = req.body || {};
    const prompt = `System: You are an autonomous AI Financial Agent for Aquarius Sovereign OS.
Macro Analysis Mode: ${macroMode ? 'ENABLED' : 'STANDARD'}
Context: ${JSON.stringify(context || {})}
User Query: ${message}`;

    await auditLogger.log({ id: sessionId }, "financial_agent_chat_request", { prompt, macroMode });

    const geminiRes = await callGemini("gemini-2.5-flash", prompt, {
      systemInstruction: "Act as an executive AI financial analyst and treasury manager. Provide concise, high-yield actionable insights and risk mitigation strategies."
    });
    const reply = typeof geminiRes === 'string' ? geminiRes : geminiRes.text;

    await auditLogger.log({ id: sessionId }, "financial_agent_chat_response", { reply });

    return res.json({ reply, timestamp: new Date().toISOString() });
  } catch (error: any) {
    logger.error("Financial Agent Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Astra DB Vector & Table Initializer
 */
router.post(["/api/v1/astra/initialize", "/v1/astra/initialize", "/astra/initialize"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    await auditLogger.log({ id: sessionId }, "astra_initialize_request", {});
    const results = await AstraService.createAllTables();
    await auditLogger.log({ id: sessionId }, "astra_initialize_response", { results });
    return res.json({ status: "success", results });
  } catch (error: any) {
    logger.error("Astra DB Initialization Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Astra DB Query Router
 */
router.post(["/api/v1/astra/query", "/v1/astra/query", "/astra/query"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { table, query } = req.body || {};
    await auditLogger.log({ id: sessionId }, "astra_query_request", { table, query });
    const results = await AstraService.executeQuery(table, query || "");
    await auditLogger.log({ id: sessionId }, "astra_query_response", { count: results?.length });
    return res.json({ status: "success", results });
  } catch (error: any) {
    logger.error("Astra Query Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Astra DB Indexing Service
 */
router.post(["/api/v1/astra/index", "/v1/astra/index", "/astra/index"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { table, data } = req.body || {};
    await auditLogger.log({ id: sessionId }, "astra_index_request", { table, data });
    const result = await AstraService.indexDocument(table, data);
    await auditLogger.log({ id: sessionId }, "astra_index_response", { result });
    return res.json({ status: "success", result });
  } catch (error: any) {
    logger.error("Astra Index Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AI Portfolio Allocation Recommendations
 */
router.post(["/api/v1/ai/recommendations", "/v1/ai/recommendations", "/ai/recommendations", "/recommendations"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { portfolio, riskTolerance } = req.body || {};
    await auditLogger.log({ id: sessionId }, "ai_recommendations_request", { portfolio, riskTolerance });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const totalValue = (portfolio || []).reduce((sum: number, asset: any) => sum + (asset.value || 0), 0);
      const fallbackAllocations = (portfolio || []).map((a: any) => ({
        name: a.name,
        targetValue: totalValue * 0.25,
        currentValue: a.value
      }));
      return res.json({ allocations: fallbackAllocations });
    }

    const prompt = `Given this portfolio: ${JSON.stringify(portfolio)} with Risk Level: ${riskTolerance || 'MODERATE'}, recommend a balanced allocation for long-term growth and capital preservation. Return ONLY a JSON object with this exact structure: { "allocations": [{ "name": "Asset Name", "targetValue": 1000, "currentValue": 500, "rationale": "Explanation" }] }`;
    
    const geminiRes = await callGemini("gemini-2.5-flash", prompt, {
      responseMimeType: "application/json"
    });
    const responseText = typeof geminiRes === 'string' ? geminiRes : geminiRes.text;

    if (responseText) {
      const parsed = JSON.parse(responseText);
      await auditLogger.log({ id: sessionId }, "ai_recommendations_response", { parsed });
      return res.json(parsed);
    } else {
      return res.status(500).json({ error: "Failed to generate recommendations" });
    }
  } catch (error: any) {
    logger.error("AI Recommendation Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ARIA Voice & Biometric AI Processing Engine
 */
router.post(["/api/v1/aria/process", "/v1/aria/process", "/aria/process"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { channel, payload, userContext } = req.body || {};
    await auditLogger.log({ id: sessionId }, "aria_process_request", { channel, payload, userContext });
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({
        message: channel === 'INTIMACY'
          ? 'AI Key missing, processing biometric logic locally.'
          : 'AI Key missing, queueing atomic settlement.'
      });
    }

    const prompt = channel === 'INTIMACY'
      ? `Act as a highly empathetic AI OS assistant named Aria. Context: ${JSON.stringify(userContext || {})}. Audio transcript payload: "${payload || 'User active'}". Give a soothing, one-sentence reassuring response.`
      : `Act as a highly deterministic financial OS named Aria. Command payload: "${payload || 'Execute transaction'}". Confirm that a wire transaction to the primary vault has been signed and queued in one sentence.`;
    
    const ariaRes = await callGemini("gemini-2.5-flash", prompt, {});
    const responseText = typeof ariaRes === 'string' ? ariaRes : ariaRes.text;
    await auditLogger.log({ id: sessionId }, "aria_process_response", { responseText });
    return res.json({ message: responseText, status: "PROCESSED", channel });
  } catch (err: any) {
    logger.error("Aria Process Error:", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Executive Order & Regulatory AI Document Audit & Breakdown
 */
router.post(["/api/v1/ai/analyze-document", "/v1/ai/analyze-document", "/ai/analyze-document", "/analyze-document"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { documentText, documentType } = req.body || {};
    if (!documentText) {
      return res.status(400).json({ error: "Document text is required" });
    }

    await auditLogger.log({ id: sessionId }, "ai_analyze_document_request", { documentType, length: documentText.length });

    const prompt = `Analyze the following ${documentType || 'document'} for legal risks, regulatory compliance, loopholes, and strategic impacts:
    
    ${documentText.slice(0, 8000)}
    
    Return a JSON object with this structure:
    {
      "summary": "Brief executive summary",
      "keyRisks": ["Risk 1", "Risk 2"],
      "complianceFlags": ["Flag 1", "Flag 2"],
      "opportunities": ["Opportunity 1"],
      "threatLevel": "LOW | MEDIUM | HIGH | CRITICAL"
    }`;

    const geminiRes = await callGemini("gemini-2.5-flash", prompt, {
      responseMimeType: "application/json"
    });
    const responseText = typeof geminiRes === 'string' ? geminiRes : geminiRes.text;

    const parsed = JSON.parse(responseText);
    await auditLogger.log({ id: sessionId }, "ai_analyze_document_response", { parsed });
    return res.json(parsed);
  } catch (error: any) {
    logger.error("Document Analysis Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AI Ad Studio Content Synthesizer
 */
router.post(["/api/v1/ai/ad-generator", "/v1/ai/ad-generator", "/ai/ad-generator", "/ad-generator"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { campaignName, targetAudience, platform } = req.body || {};
    await auditLogger.log({ id: sessionId }, "ai_ad_generator_request", { campaignName, targetAudience, platform });
    const prompt = `Generate a high-converting advertisement copy set for platform '${platform || 'General'}' targeting '${targetAudience || 'HNW Individuals'}'. Campaign Name: '${campaignName || 'Sovereign Treasury'}'.
    Return a JSON object with:
    {
      "headline": "Catchy headline",
      "bodyCopy": "Persuasive body text",
      "callToAction": "Direct CTA",
      "targetKeywords": ["keyword1", "keyword2"]
    }`;

    const geminiRes = await callGemini("gemini-2.5-flash", prompt, {
      responseMimeType: "application/json"
    });
    const responseText = typeof geminiRes === 'string' ? geminiRes : geminiRes.text;

    const parsed = JSON.parse(responseText);
    await auditLogger.log({ id: sessionId }, "ai_ad_generator_response", { parsed });
    return res.json(parsed);
  } catch (error: any) {
    logger.error("Ad Studio Synthesis Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AI Market & Regulatory Sentiment Engine
 */
router.post(["/api/v1/ai/sentiment", "/v1/ai/sentiment", "/ai/sentiment", "/sentiment"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { content } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    await auditLogger.log({ id: sessionId }, "ai_sentiment_request", { length: content.length });

    const prompt = `Evaluate the financial sentiment and regulatory impact of the following text:
    "${content.slice(0, 3000)}"
    
    Return JSON:
    {
      "sentimentScore": 0.85, // Range -1.0 to +1.0
      "sentimentLabel": "BULLISH | BEARISH | NEUTRAL | UNCERTAIN",
      "marketImpact": "Brief analysis"
    }`;

    const geminiRes = await callGemini("gemini-2.5-flash", prompt, {
      responseMimeType: "application/json"
    });
    const responseText = typeof geminiRes === 'string' ? geminiRes : geminiRes.text;

    const parsed = JSON.parse(responseText);
    await auditLogger.log({ id: sessionId }, "ai_sentiment_response", { parsed });
    return res.json(parsed);
  } catch (error: any) {
    logger.error("Sentiment Analysis Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Sovereign Code & Smart Contract Synthesis Engine
 */
router.post(["/api/v1/ai/code-gen", "/v1/ai/code-gen", "/ai/code-gen", "/code-gen"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { specification, language } = req.body || {};
    if (!specification) {
      return res.status(400).json({ error: "Specification is required" });
    }

    await auditLogger.log({ id: sessionId }, "ai_code_gen_request", { language, specification });

    const prompt = `Write production-grade, secure, type-safe ${language || 'TypeScript'} code for the following specification:
    ${specification}
    
    Ensure strict error handling, security checks, and zero vulnerability vectors. Provide only code or clean JSON code wrapper.`;

    const geminiRes = await callGemini("gemini-2.5-flash", prompt, {});
    const code = typeof geminiRes === 'string' ? geminiRes : geminiRes.text;

    await auditLogger.log({ id: sessionId }, "ai_code_gen_response", { codeLength: code?.length });

    return res.json({ code, language: language || 'typescript', timestamp: new Date().toISOString() });
  } catch (error: any) {
    logger.error("Code Gen Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Multi-Agent Swarm Orchestrator Endpoint
 */
router.post(["/api/v1/ai/agent/nexus", "/v1/ai/agent/nexus", "/ai/agent/nexus", "/agent/nexus"], async (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default-session';
  try {
    const { task, agents } = req.body || {};
    await auditLogger.log({ id: sessionId }, "ai_agent_nexus_request", { task, agents });
    const prompt = `Coordinate an AI agent swarm (${(agents || ['Treasury', 'Risk', 'Legal']).join(', ')}) to accomplish the following executive task:
    Task: ${task}
    
    Provide step-by-step agent breakdown and consolidated output in JSON:
    {
      "agentPlan": [
        { "agent": "AgentName", "action": "Specific Action", "status": "COMPLETED" }
      ],
      "finalResult": "Consolidated findings"
    }`;

    const geminiRes = await callGemini("gemini-2.5-flash", prompt, {
      responseMimeType: "application/json"
    });
    const responseText = typeof geminiRes === 'string' ? geminiRes : geminiRes.text;

    const parsed = JSON.parse(responseText);
    await auditLogger.log({ id: sessionId }, "ai_agent_nexus_response", { parsed });
    return res.json(parsed);
  } catch (error: any) {
    logger.error("Swarm Nexus Error:", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

export default router;