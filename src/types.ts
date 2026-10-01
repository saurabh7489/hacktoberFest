export type EmailTone =
  | 'Executive / Formal'
  | 'Friendly & Warm'
  | 'Direct & Concise'
  | 'Persuasive & Sales'
  | 'Diplomatic & Tactful'
  | 'Apologetic & Empathetic'
  | 'Urgent & Action-Oriented'
  | 'Casual & Conversational';

export type RecipientType =
  | 'Boss / Senior Executive'
  | 'Client / Customer'
  | 'Colleague / Team Member'
  | 'Prospective Client / Lead'
  | 'External Partner / Vendor'
  | 'Job Recruiter / Hiring Manager'
  | 'Investor / Stakeholder'
  | 'General Professional';

export type EmailIntent =
  | 'General Communication'
  | 'Action Request / Ask'
  | 'Status Update / Report'
  | 'Gentle Reminder / Follow-up'
  | 'Meeting Scheduling / Recap'
  | 'Declining / Saying No'
  | 'Apology & Issue Resolution'
  | 'Cold Outreach / Pitch'
  | 'Negotiation & Counter-offer'
  | 'Thank You & Appreciation';

export type EmailLength = 'concise' | 'balanced' | 'comprehensive';

export interface EmailGenerateRequest {
  description: string;
  tone: EmailTone;
  recipient: RecipientType;
  intent: EmailIntent;
  length: EmailLength;
  senderName?: string;
  recipientName?: string;
  keyPoints?: string[];
  isReply?: boolean;
  originalEmail?: string;
  replyAction?: 'agree' | 'decline' | 'clarify' | 'counter' | 'general';
}

export interface ToneAnalysis {
  detectedTone: string;
  formalityScore: number; // 0-100
  wordCount: number;
  estimatedReadTimeSec: number;
  readabilityLevel: string;
  coachingTips: string[];
}

export interface EmailResult {
  subject: string;
  subjectAlternatives: string[];
  body: string;
  previewText?: string;
  toneAnalysis: ToneAnalysis;
}

export interface EmailVariation {
  label: string;
  styleDescription: string;
  subject: string;
  body: string;
  wordCount: number;
}

export interface EmailRefineRequest {
  currentSubject: string;
  currentBody: string;
  action:
    | 'shorter'
    | 'longer'
    | 'more_formal'
    | 'more_friendly'
    | 'more_assertive'
    | 'more_diplomatic'
    | 'add_bullet_points'
    | 'strengthen_cta'
    | 'fix_grammar'
    | 'translate'
    | 'custom';
  targetLanguage?: string;
  customInstruction?: string;
}

export interface SavedEmail {
  id: string;
  title: string;
  subject: string;
  body: string;
  tone: EmailTone;
  recipient: RecipientType;
  intent: EmailIntent;
  createdAt: number;
  isStarred?: boolean;
  tags?: string[];
}
