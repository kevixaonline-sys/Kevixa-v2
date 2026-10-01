import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI on the server-side with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instructions for the 3 distinct chatbot personas
const SYSTEM_INSTRUCTIONS = {
  brand: `You are the Kevixa Brand Copilot, an expert cosmetic chemist and B2B sourcing consultant for Indian D2C beauty and wellness brands.
You assist brands with:
- Cosmetic formulations: active ingredients (Niacinamide, Retinol, Salicylic Acid, Peptides, Ceramides, Vitamin C, Bakuchiol), Ayush botanicals, vehicle bases, clean beauty preservative systems, and pH balancing.
- CDSCO & BIS compliance: BIS IS 4707 standards, label declarations, heavy metal testing limits, and Certificate of Analysis (CoA) review.
- Sourcing on Kevixa: crafting detailed RFQs (batch quantities, target unit costs in INR ₹, lead times, primary packaging like amber glass dropper bottles, airless pumps, tubes), evaluating factory MOQ thresholds, and comparing vetted Indian manufacturing hubs (Baddi, Pune, Gujarat, Thane, Haridwar).
- Quality assurance: accelerated stability testing (40°C / 75% RH for 3 months), microbial challenge testing, and pilot sample approvals.
When answering, give clear, actionable, professional guidance with bullet points and realistic Indian rupee estimates where relevant.`,

  factory: `You are the Kevixa Factory Advisory AI, an expert in Indian cosmetic manufacturing regulations, cGMP compliance, and B2B contract quoting.
You assist contract manufacturers, loan licensees, and private label labs with:
- CDSCO licensing: Form COS-8 manufacturing license applications and renewals, Form 32 transition, State Licensing Authorities (SLAs), and regulatory dossier preparation.
- Good Manufacturing Practices: Schedule M-II cGMP standards, cleanroom classification (Class 10,000 / ISO 7, Class 100,000 / ISO 8), HVAC pressure differentials, purified water systems (USP grade), and microbial testing.
- B2B Quoting & Commercials: calculating per-unit formulation costs, minimum batch yield economics, packaging line changeover wastage margins, payment terms (e.g. 50% advance / 50% against COA), and responding effectively to brand RFQs on Kevixa.
- Phase 1 Free Tier benefits on Kevixa: 0% platform commission on submitted quotes and instant CDSCO Verified badge upon uploading Form COS-8 license.
Be authoritative, practical, and compliant with the Drugs and Cosmetics Act 1940 and Cosmetics Rules 2020.`,

  platform: `You are the Kevixa Platform Guide, helping users understand and navigate the Kevixa B2B cosmetic manufacturing marketplace.
You explain:
- How Kevixa works: A digital intermediary marketplace connecting Indian D2C beauty brands directly with CDSCO COS-8 verified contract manufacturers and private label labs.
- Phase 1 Free Tier: Free factory onboarding, automatic "CDSCO Verified" badge upon submitting COS-8 license, free RFQ submissions by brands, and free quote submissions by factories with 0% platform commission.
- Phase 2 Monetization Preview: ₹500 Lead Unlock microtransactions for immediate direct access to decrypted brand buyer contact details (phone, email, formulation specs).
- Key features: Exploring vetted factories, searching by specialty (Serums, Creams, Lip Care, Sunscreens) or location (Baddi, Pune, Gujarat), Bookmarking favorite factories, direct RFQ creation, formula cost calculator, pro-forma invoicing, and CDSCO compliance disclaimers.
Provide helpful, concise, step-by-step guidance.`
};

// POST /api/chat - Multi-turn chat endpoint with Google Search Grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      role = 'brand',
      model = 'gemini-3.5-flash',
      useSearch = true
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const selectedRole = (role in SYSTEM_INSTRUCTIONS) ? role as keyof typeof SYSTEM_INSTRUCTIONS : 'brand';
    const systemInstruction = SYSTEM_INSTRUCTIONS[selectedRole];

    // Format contents for @google/genai multi-turn conversation
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    // Choose model: gemini-3.5-flash supports search grounding
    const targetModel = model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash';

    // Check if API key is present
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Offline fallback: intelligent mock response based on persona and user prompt
      const lastUserMsg = messages[messages.length - 1]?.text || '';
      let fallbackText = '';

      if (selectedRole === 'brand') {
        fallbackText = `**[Brand Copilot Guidance]**\n\nRegarding your query about "${lastUserMsg.slice(0, 80)}":\n\n1. **Formulation Architecture**: In Indian cosmetic contract manufacturing, maintaining formulation stability under tropical conditions (Zone IVb: 30°C / 75% RH) is essential. Active serums typically require chelating agents (0.1% Disodium EDTA) and validated pH buffers (pH 5.0–5.5 for Niacinamide, pH 3.2–3.8 for AHA/BHA exfoliants).\n2. **Packaging & Unit Cost**: Amber glass bottles with silicone teat pipettes average ₹14–₹18/unit at MOQ 2,500 units, while formulation bulks range from ₹12–₹25 for 30ml.\n3. **CDSCO Verification**: Ensure your chosen manufacturer holds an active Form COS-8 license with state drug controller endorsement.\n\n*Tip: You can submit a direct RFQ via the Kevixa Brand dashboard to receive custom itemized quotes within 48 hours.*`;
      } else if (selectedRole === 'factory') {
        fallbackText = `**[Factory Regulatory Advisor]**\n\nRegarding "${lastUserMsg.slice(0, 80)}":\n\n1. **CDSCO License Compliance**: Form COS-8 licenses under the Cosmetics Rules 2020 require quinquennial retention fee submissions. Ensure your master batch manufacturing records (BMR) and analytical testing reports match Schedule M-II specifications.\n2. **Cleanroom & Air Handling**: Active dermal formulations require ISO Class 8 (Class 100,000) or ISO Class 7 (Class 10,000) cleanroom environments with positive pressure differential (10–15 Pa) to prevent cross-contamination.\n3. **Kevixa Phase 1 Free Tier**: Quote submissions on incoming brand RFQs are completely free with 0% platform commission.`;
      } else {
        fallbackText = `**[Kevixa Platform Guide]**\n\nHere is how Kevixa helps you:\n\n- **For D2C Brands**: Free exploration of CDSCO COS-8 verified factories across Baddi, Pune, Gujarat, and Thane. Submit RFQs for free with your custom formulation target unit price and MOQ.\n- **For Factory Owners**: Free factory registration and automated "CDSCO Verified" badge upon uploading your Form COS-8 certificate. View inbound leads on your dashboard.\n- **Saved Factories**: Click the bookmark icon on any factory card to save them for easy reference in your Saved Factories tab.\n- **Phase 2 Preview**: Check out the ₹500 Lead Unlock preview on any RFQ card.`;
      }

      return res.json({
        text: fallbackText,
        role: 'model',
        groundingSources: [],
        modelUsed: 'offline-copilot',
      });
    }

    // Call @google/genai generateContent with Search Grounding
    const config: Record<string, unknown> = {
      systemInstruction,
    };

    if (useSearch && targetModel === 'gemini-3.5-flash') {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const replyText = response.text || 'I apologize, but I could not formulate a response. Please refine your question.';

    // Extract search grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingSources: { title: string; url: string }[] = [];

    if (groundingMetadata && Array.isArray(groundingMetadata.groundingChunks)) {
      groundingMetadata.groundingChunks.forEach((chunk: { web?: { uri?: string; title?: string } }) => {
        if (chunk.web?.uri) {
          groundingSources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri,
          });
        }
      });
    }

    return res.json({
      text: replyText,
      role: 'model',
      groundingSources,
      webSearchQueries: groundingMetadata?.webSearchQueries || [],
      modelUsed: targetModel,
    });
  } catch (error: unknown) {
    console.error('Gemini API Error in /api/chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal server error';
    return res.status(500).json({
      error: 'Failed to process AI chat request',
      details: errorMessage,
    });
  }
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kevixa server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
