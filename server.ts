import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import type {
  EmailGenerateRequest,
  EmailResult,
  EmailRefineRequest,
  EmailVariation,
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function generateWithFallback(params: any): Promise<any> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed, attempting next if available...`, err.message || err);
      // Wait 500ms before next attempt if transient
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw lastError;
}

// Helper to sanitize markdown fences if any
function extractCleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// 1. Generate Email endpoint
app.post('/api/email/generate', async (req, res) => {
  try {
    const data: EmailGenerateRequest = req.body;

    if (!data.description?.trim()) {
      return res.status(400).json({ error: 'Description or notes are required.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your environment variables.',
      });
    }

    const lengthGuide =
      data.length === 'concise'
        ? 'Very concise and punchy (approximately 60-110 words). Cut all filler.'
        : data.length === 'comprehensive'
        ? 'Detailed and thorough (approximately 200-320 words), explaining context, clear sections or bullet points, and explicit next steps.'
        : 'Balanced professional length (approximately 120-180 words), structured and easy to scan.';

    const contextRole = `
You are an expert executive communications specialist and email strategist.
Generate an exceptionally crafted, ready-to-send professional email.

Parameters:
- Desired Tone: ${data.tone}
- Target Recipient: ${data.recipient}
- Core Intent: ${data.intent}
- Length Target: ${lengthGuide}
- Sender Name: ${data.senderName || '[Your Name]'}
- Recipient Name: ${data.recipientName || '[Recipient Name]'}
${data.keyPoints && data.keyPoints.length > 0 ? `- Must-Include Details / Key Points:\n${data.keyPoints.map(p => `  * ${p}`).join('\n')}` : ''}
${data.isReply ? `
THIS IS A REPLY TO AN EXISTING EMAIL:
Original Email:
"""
${data.originalEmail || ''}
"""
Reply Action / Stance: ${data.replyAction || 'general'}
` : ''}

User's Request / Notes:
"""
${data.description}
"""

Email Writing Standards:
1. Subject line must be high-converting, professional, specific, and clear (never generic like "Follow up" or "Meeting").
2. Provide 3 distinctly angled alternative subject lines (e.g. 1 direct/clear, 1 action/deadline-driven, 1 warm/collaborative).
3. The body must match the requested tone precisely. Respect business etiquette without sounding like a robotic boilerplate.
4. Avoid corporate jargon clichés (like "hope this email finds you well" unless specifically warm/diplomatic tone warrants a natural greeting).
5. Ensure call-to-action is crystal clear.
6. Provide a 1-sentence inbox preheader/preview snippet.
7. Provide a realistic tone audit with formality score (0-100), word count, estimated reading time in seconds, readability assessment, and 2 actionable coaching tips.
`;

    const response = await generateWithFallback({
      contents: contextRole,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: 'Primary recommended email subject line.',
            },
            subjectAlternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 alternative subject line options with different angles.',
            },
            body: {
              type: Type.STRING,
              description: 'Full email body with greeting, structured paragraphs/bullet points, call to action, and sign-off.',
            },
            previewText: {
              type: Type.STRING,
              description: '1-line preview/preheader snippet displayed in email clients.',
            },
            toneAnalysis: {
              type: Type.OBJECT,
              properties: {
                detectedTone: { type: Type.STRING },
                formalityScore: { type: Type.NUMBER, description: 'Scale 0 to 100' },
                wordCount: { type: Type.NUMBER },
                estimatedReadTimeSec: { type: Type.NUMBER },
                readabilityLevel: { type: Type.STRING },
                coachingTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'detectedTone',
                'formalityScore',
                'wordCount',
                'estimatedReadTimeSec',
                'readabilityLevel',
                'coachingTips',
              ],
            },
          },
          required: ['subject', 'subjectAlternatives', 'body', 'previewText', 'toneAnalysis'],
        },
      },
    });

    const parsed: EmailResult = JSON.parse(extractCleanJson(response.text || '{}'));
    res.json(parsed);
  } catch (err: any) {
    console.error('Error generating email:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate email draft. Please try again.',
    });
  }
});

// 2. Refine Email endpoint
app.post('/api/email/refine', async (req, res) => {
  try {
    const data: EmailRefineRequest = req.body;

    if (!data.currentBody?.trim()) {
      return res.status(400).json({ error: 'Current email body is required for refinement.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    let refinementPrompt = '';
    switch (data.action) {
      case 'shorter':
        refinementPrompt = 'Make this email significantly tighter and more concise, trimming redundant phrases while retaining all crucial facts and clear action items.';
        break;
      case 'longer':
        refinementPrompt = 'Expand this email with thoughtful context, polite framing, and clearer elaboration on the points, without adding unnecessary fluff.';
        break;
      case 'more_formal':
        refinementPrompt = 'Elevate this email to a polished executive standard. Use elevated vocabulary, formal courtesy, and impeccable corporate decorum.';
        break;
      case 'more_friendly':
        refinementPrompt = 'Make this email noticeably warmer, friendlier, and more approachable. Add warm rapport while staying thoroughly professional.';
        break;
      case 'more_assertive':
        refinementPrompt = 'Make this email more assertive, confident, and direct. Eliminate weak or apologetic qualifiers (like "just wondering", "sorry to bother", "if possible"). State decisions and expectations with respectful authority.';
        break;
      case 'more_diplomatic':
        refinementPrompt = 'Make this email more diplomatic, tactful, and constructive. Soften potential friction points, express appreciation for collaboration, and frame requests constructively.';
        break;
      case 'add_bullet_points':
        refinementPrompt = 'Reorganize the core details, deliverables, or questions into clear, scannable bullet points with bold prefixes.';
        break;
      case 'strengthen_cta':
        refinementPrompt = 'Sharpen the closing and Call-to-Action (CTA). Make the next step, owner, deadline, and easy-response question undeniably clear and low-friction for the recipient.';
        break;
      case 'fix_grammar':
        refinementPrompt = 'Proofread and polish grammar, punctuation, sentence flow, and spelling to pristine professional perfection.';
        break;
      case 'translate':
        refinementPrompt = `Translate this email naturally into ${data.targetLanguage || 'Spanish'}, ensuring culturally appropriate business etiquette and professional phrasing for an email.`;
        break;
      case 'custom':
        refinementPrompt = `Apply the following custom instruction: "${data.customInstruction || 'Improve clarity'}"`;
        break;
      default:
        refinementPrompt = 'Enhance clarity, readability, and professional flow.';
    }

    const prompt = `
You are an expert executive email editor.
Current Subject: "${data.currentSubject || ''}"
Current Email Body:
"""
${data.currentBody}
"""

Task:
${refinementPrompt}

Maintain placeholders like [Name], [Company], [Date] if present, or adapt them logically.
Return the updated subject line, the revised email body, and a brief 1-sentence change summary explaining what was modified.
`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
            changeSummary: { type: Type.STRING },
          },
          required: ['subject', 'body', 'changeSummary'],
        },
      },
    });

    const parsed = JSON.parse(extractCleanJson(response.text || '{}'));
    res.json(parsed);
  } catch (err: any) {
    console.error('Error refining email:', err);
    res.status(500).json({
      error: err.message || 'Failed to refine email.',
    });
  }
});

// 3. Variations endpoint (generate 3 distinct styles simultaneously)
app.post('/api/email/variations', async (req, res) => {
  try {
    const data: EmailGenerateRequest = req.body;

    if (!data.description?.trim()) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const prompt = `
You are an elite business communications consultant.
Based on the following email details:
- Topic / Request: "${data.description}"
- Target Recipient: ${data.recipient}
- Core Intent: ${data.intent}
- Sender: ${data.senderName || '[Your Name]'}
- Recipient: ${data.recipientName || '[Recipient Name]'}

Generate 3 distinct, complete versions of this email representing 3 different strategic approaches:
1. Version 1 ("Direct & Action-Driven"): Fast to read, bullet-pointed, zero fluff, immediate CTA.
2. Version 2 ("Diplomatic & Relationship-First"): Warm, appreciative, relationship-building, polite framing.
3. Version 3 ("Executive Briefing"): Strategic, high-level summary, formal tone, high-credibility framing.

Each version must have a tailored subject line, full body, word count, and style description.
`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: 'e.g. Direct & Action-Driven' },
                  styleDescription: { type: Type.STRING, description: 'e.g. 85 words · High urgency · Bullet points' },
                  subject: { type: Type.STRING },
                  body: { type: Type.STRING },
                  wordCount: { type: Type.NUMBER },
                },
                required: ['label', 'styleDescription', 'subject', 'body', 'wordCount'],
              },
            },
          },
          required: ['variations'],
        },
      },
    });

    const parsed = JSON.parse(extractCleanJson(response.text || '{}'));
    res.json(parsed.variations as EmailVariation[]);
  } catch (err: any) {
    console.error('Error generating variations:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate email variations.',
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MailCraft AI server running on port ${PORT}`);
});
