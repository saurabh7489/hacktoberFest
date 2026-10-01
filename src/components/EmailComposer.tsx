import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Briefcase,
  Smile,
  Zap,
  Flame,
  ShieldCheck,
  HeartHandshake,
  Clock,
  MessageSquare,
  Send,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import type {
  EmailTone,
  RecipientType,
  EmailIntent,
  EmailLength,
  EmailGenerateRequest,
} from '../types';

interface EmailComposerProps {
  mode: 'compose' | 'reply';
  formData: {
    description: string;
    tone: EmailTone;
    recipient: RecipientType;
    intent: EmailIntent;
    length: EmailLength;
    senderName: string;
    recipientName: string;
    keyPoints: string[];
    originalEmail: string;
    replyAction: 'agree' | 'decline' | 'clarify' | 'counter' | 'general';
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onGenerate: (e?: React.FormEvent) => void;
  isLoading: boolean;
  onApplyTemplateSnippet: (snippet: { notes: string; tone: EmailTone; intent: EmailIntent }) => void;
}

const TONE_OPTIONS: { id: EmailTone; label: string; desc: string; icon: React.ElementType }[] = [
  {
    id: 'Executive / Formal',
    label: 'Executive / Formal',
    desc: 'Authoritative, polished corporate decorum',
    icon: Briefcase,
  },
  {
    id: 'Direct & Concise',
    label: 'Direct & Concise',
    desc: 'Gets straight to the point with zero filler',
    icon: Zap,
  },
  {
    id: 'Friendly & Warm',
    label: 'Friendly & Warm',
    desc: 'Approachable, collaborative, builds rapport',
    icon: Smile,
  },
  {
    id: 'Diplomatic & Tactful',
    label: 'Diplomatic & Tactful',
    desc: 'Softens friction, constructive pushback',
    icon: ShieldCheck,
  },
  {
    id: 'Persuasive & Sales',
    label: 'Persuasive & Sales',
    desc: 'Highlights value proposition, motivates action',
    icon: Flame,
  },
  {
    id: 'Urgent & Action-Oriented',
    label: 'Urgent & Action-Oriented',
    desc: 'Flags time sensitivity and immediate next steps',
    icon: Clock,
  },
  {
    id: 'Apologetic & Empathetic',
    label: 'Apologetic & Empathetic',
    desc: 'Owns mistakes sincerely with clear recovery',
    icon: HeartHandshake,
  },
  {
    id: 'Casual & Conversational',
    label: 'Casual & Conversational',
    desc: 'Relaxed, modern workplace communication',
    icon: MessageSquare,
  },
];

const RECIPIENT_OPTIONS: RecipientType[] = [
  'Boss / Senior Executive',
  'Client / Customer',
  'Colleague / Team Member',
  'Prospective Client / Lead',
  'External Partner / Vendor',
  'Job Recruiter / Hiring Manager',
  'Investor / Stakeholder',
  'General Professional',
];

const INTENT_OPTIONS: EmailIntent[] = [
  'Action Request / Ask',
  'Gentle Reminder / Follow-up',
  'Status Update / Report',
  'Meeting Scheduling / Recap',
  'Declining / Saying No',
  'Apology & Issue Resolution',
  'Cold Outreach / Pitch',
  'Negotiation & Counter-offer',
  'Thank You & Appreciation',
  'General Communication',
];

const QUICK_STARTERS = [
  {
    label: 'Deadline Extension',
    notes: 'Need 3 more days on the analytics report due to delayed data export. Draft is 70% done.',
    tone: 'Executive / Formal' as EmailTone,
    intent: 'Action Request / Ask' as EmailIntent,
  },
  {
    label: 'Follow Up Unanswered',
    notes: 'Checking in on the project proposal sent last Thursday. Keen to confirm next steps.',
    tone: 'Direct & Concise' as EmailTone,
    intent: 'Gentle Reminder / Follow-up' as EmailIntent,
  },
  {
    label: 'Decline Invitation',
    notes: 'Invited to join quarterly committee but committed to Q4 rollout. Suggesting colleague instead.',
    tone: 'Diplomatic & Tactful' as EmailTone,
    intent: 'Declining / Saying No' as EmailIntent,
  },
  {
    label: 'Service Apology',
    notes: 'Apologizing for 2hr downtime on customer portal yesterday. Issue fixed, 10% credit granted.',
    tone: 'Apologetic & Empathetic' as EmailTone,
    intent: 'Apology & Issue Resolution' as EmailIntent,
  },
];

export const EmailComposer: React.FC<EmailComposerProps> = ({
  mode,
  formData,
  setFormData,
  onGenerate,
  isLoading,
  onApplyTemplateSnippet,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newKeyPoint, setNewKeyPoint] = useState('');

  const handleAddKeyPoint = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newKeyPoint.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        keyPoints: [...(prev.keyPoints || []), newKeyPoint.trim()],
      }));
      setNewKeyPoint('');
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Title & Quick Starters */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="description-input"
            className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"
          >
            <span>{mode === 'reply' ? 'What do you want to say in your reply?' : 'What do you want to say?'}</span>
            <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-slate-400">
            {formData.description.length} chars
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {mode === 'reply'
            ? 'Jot down your main answer, decisions, key questions, or next steps in plain English.'
            : 'Type a quick sentence, rough bullet points, or raw thoughts. MailCraft will transform it into a polished email.'}
        </p>

        {/* Reply original email input if in reply mode */}
        {mode === 'reply' && (
          <div className="mb-4 space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <label htmlFor="received-email-text" className="text-xs font-semibold text-slate-800">
                Email You Received (Paste below):
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Stance:</span>
                <select
                  value={formData.replyAction}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      replyAction: e.target.value as any,
                    }))
                  }
                  className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="general">Balanced / General Reply</option>
                  <option value="agree">Agree & Confirm</option>
                  <option value="decline">Politely Decline</option>
                  <option value="clarify">Ask for Clarification</option>
                  <option value="counter">Counter-Offer / Negotiate</option>
                </select>
              </div>
            </div>
            <textarea
              id="received-email-text"
              rows={3}
              value={formData.originalEmail}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  originalEmail: e.target.value,
                }))
              }
              placeholder="Paste the email you received here (sender, questions, requests)..."
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono"
            />
          </div>
        )}

        <textarea
          id="description-input"
          rows={mode === 'reply' ? 3 : 4}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'reply'
              ? 'e.g. Yes to meeting at 2pm on Thursday. Bring the quarterly roadmap deck. Ask if Alex will join too.'
              : 'e.g. Tell the client the cloud migration sprint is 80% done, but testing needs 2 more days because the staging database was down. Ask if we can push go-live to Friday morning.'
          }
          className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none shadow-2xs leading-relaxed"
        />

        {/* Quick Starters if empty */}
        {mode === 'compose' && !formData.description && (
          <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Starters:</span>
            {QUICK_STARTERS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onApplyTemplateSnippet(s)}
                className="text-[11px] text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 bg-slate-100 px-2 py-0.5 rounded transition-colors"
              >
                + {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tone Selection Grid */}
      <div>
        <label className="text-sm font-semibold text-slate-900 block mb-1">
          Desired Tone
        </label>
        <p className="text-xs text-slate-500 mb-2.5">
          Select the strategic voice that best suits your audience and objective.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TONE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = formData.tone === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setFormData((prev: any) => ({ ...prev, tone: item.id }))
                }
                className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-medium">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label.split(' / ')[0]}</span>
                </div>
                <span className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient & Intent Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="recipient-select" className="text-xs font-semibold text-slate-800 block mb-1">
            Recipient Audience
          </label>
          <div className="relative">
            <select
              id="recipient-select"
              value={formData.recipient}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  recipient: e.target.value as RecipientType,
                }))
              }
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs appearance-none cursor-pointer"
            >
              {RECIPIENT_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="intent-select" className="text-xs font-semibold text-slate-800 block mb-1">
            Email Goal / Intent
          </label>
          <div className="relative">
            <select
              id="intent-select"
              value={formData.intent}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  intent: e.target.value as EmailIntent,
                }))
              }
              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs appearance-none cursor-pointer"
            >
              {INTENT_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Length Preference */}
      <div>
        <label className="text-xs font-semibold text-slate-800 block mb-1.5">
          Email Length Preference
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'concise', label: 'Concise', range: '50-100 words' },
              { id: 'balanced', label: 'Balanced', range: '120-180 words' },
              { id: 'comprehensive', label: 'Detailed', range: '200-300 words' },
            ] as const
          ).map((l) => {
            const isSelected = formData.length === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() =>
                  setFormData((prev: any) => ({ ...prev, length: l.id }))
                }
                className={`py-2 px-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-medium">{l.label}</div>
                <div className="text-[10px] text-slate-500">{l.range}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced / Personalization Accordion */}
      <div className="border-t border-slate-200/80 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-medium text-slate-600 hover:text-slate-900 py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Personalization & Must-Include Details</span>
            {formData.keyPoints.length > 0 && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {formData.keyPoints.length} details
              </span>
            )}
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="recipient-name-input" className="text-[11px] font-medium text-slate-700 block mb-1">
                  Recipient Name (Optional)
                </label>
                <input
                  id="recipient-name-input"
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      recipientName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Sarah Connor"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="sender-name-input" className="text-[11px] font-medium text-slate-700 block mb-1">
                  Your Name / Signature (Optional)
                </label>
                <input
                  id="sender-name-input"
                  type="text"
                  value={formData.senderName}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      senderName: e.target.value,
                    }))
                  }
                  placeholder="e.g. David Miller"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Key Points list */}
            <div>
              <label htmlFor="key-detail-input" className="text-[11px] font-medium text-slate-700 block mb-1">
                Must-Include Bullet Points or Specific Constraints
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="key-detail-input"
                  type="text"
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyPoint();
                    }
                  }}
                  placeholder="e.g. Deadline is Oct 14 at 5 PM EST, Link to Figma in body"
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddKeyPoint()}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {formData.keyPoints.length > 0 && (
                <div className="space-y-1.5">
                  {formData.keyPoints.map((point: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded text-slate-800"
                    >
                      <span className="truncate pr-2">• {point}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyPoint(idx)}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Action Submit Button */}
      <div>
        <button
          type="button"
          onClick={() => onGenerate()}
          disabled={isLoading || !formData.description.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all duration-150"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Crafting Professional Email...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{mode === 'reply' ? 'Generate Reply Email' : 'Generate Professional Email'}</span>
              <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-blue-700/60 rounded text-blue-100">
                ⌘ + Enter
              </kbd>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Powered by Gemini 3.8 Flash · Instant smart revisions and alternative takes
        </p>
      </div>
    </div>
  );
};
