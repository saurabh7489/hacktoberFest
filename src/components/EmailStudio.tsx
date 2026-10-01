import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Download,
  Bookmark,
  Sparkles,
  Scissors,
  Maximize2,
  Minimize2,
  Wand2,
  Languages,
  CheckCheck,
  FileText,
  ListOrdered,
  Layers,
  ArrowRight,
  TrendingUp,
  Info,
  Shield,
  Clock,
  Edit3,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  EmailResult,
  EmailVariation,
  EmailTone,
  RecipientType,
  EmailIntent,
} from '../types';
import {
  createMailtoUrl,
  downloadAsEml,
  downloadAsFile,
  calculateWordCount,
  estimateReadTimeSeconds,
} from '../utils/emailUtils';

interface EmailStudioProps {
  result: EmailResult | null;
  onUpdateResult: (updated: EmailResult) => void;
  isLoading: boolean;
  onRefine: (action: string, extra?: { targetLanguage?: string; customInstruction?: string }) => void;
  isRefining: boolean;
  refinementSummary: string | null;
  variations: EmailVariation[] | null;
  isLoadingVariations: boolean;
  onFetchVariations: () => void;
  onSaveDraft: (title: string) => void;
  formData: {
    tone: EmailTone;
    recipient: RecipientType;
    intent: EmailIntent;
  };
}

export const EmailStudio: React.FC<EmailStudioProps> = ({
  result,
  onUpdateResult,
  isLoading,
  onRefine,
  isRefining,
  refinementSummary,
  variations,
  isLoadingVariations,
  onFetchVariations,
  onSaveDraft,
  formData,
}) => {
  const [activeTab, setActiveTab] = useState<'draft' | 'variations' | 'audit'>('draft');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPromptText, setCustomPromptText] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // If no result and not loading, show empty / welcome state
  if (!result && !isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Your Email Studio is Ready
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          Type your brief description on the left, pick your preferred tone, and click
          "Generate Professional Email" to draft high-converting, boardroom-ready emails.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left text-xs">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Smart Subject Lines</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Multiple high-open rate options with 1-click swap.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-1">
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>1-Click Polishing</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Tighten, expand, soften, or strengthen CTA with one tap.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Executive Audit</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Formality score, scan time, and clarity coaching.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-10 flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div className="absolute -inset-1 border-2 border-blue-500 border-t-transparent rounded-2xl animate-spin" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Drafting Your Email...
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Synthesizing your key details, matching recipient etiquette, and tuning tone parameters.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Generating high-impact subject lines and structured copy</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const wordCount = calculateWordCount(result.body);
  const readSec = estimateReadTimeSeconds(wordCount);

  const handleCopySubject = async () => {
    try {
      await navigator.clipboard.writeText(result.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(result.body);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToDrafts = () => {
    onSaveDraft(result.subject || 'Untitled Email');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const languages = [
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Portuguese',
    'Italian',
    'Mandarin Chinese',
    'Hindi',
    'Arabic',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Studio Header Bar */}
      <div className="border-b border-slate-200 p-4 sm:px-6 bg-slate-50/50">
        {/* Navigation Tabs & Status */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('draft')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'draft'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email Draft
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('variations');
                if (!variations && !isLoadingVariations) {
                  onFetchVariations();
                }
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'variations'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3 Strategic Takes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Tone Audit</span>
            </button>
          </div>

          {/* Quick Metrics (clean unboxed text with separators) */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{wordCount} words</span>
            <span aria-hidden="true">·</span>
            <span>~{readSec}s read</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-700 font-medium">
              {result.toneAnalysis?.formalityScore}% formality
            </span>
          </div>
        </div>

        {/* Subject Line Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Subject Line
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopySubject}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
                title="Copy subject line"
              >
                {copiedSubject ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={result.subject}
              onChange={(e) =>
                onUpdateResult({ ...result, subject: e.target.value })
              }
              className="w-full text-sm font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
              placeholder="Email subject line..."
            />
          </div>

          {/* Subject Alternatives (1-click to swap) */}
          {result.subjectAlternatives && result.subjectAlternatives.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium mr-1">
                Alternative angles:
              </span>
              {result.subjectAlternatives.map((alt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onUpdateResult({ ...result, subject: alt })}
                  className="text-[11px] text-slate-600 hover:text-blue-700 hover:bg-blue-50 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded transition-colors text-left truncate max-w-xs"
                  title="Click to use this subject line"
                >
                  {alt}
                </button>
              ))}
            </div>
          )}

          {/* Preheader Preview */}
          {result.previewText && (
            <div className="mt-1.5 text-[11px] text-slate-400 truncate">
              <span className="font-medium text-slate-500">Inbox preview:</span>{' '}
              {result.previewText}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'draft' && (
        <div className="flex-1 flex flex-col">
          {/* Refinement Summary Banner if recently edited */}
          {refinementSummary && (
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{refinementSummary}</span>
              </div>
            </div>
          )}

          {/* Email Body Editor */}
          <div className="p-4 sm:p-6 flex-1 min-h-[340px] flex flex-col">
            <textarea
              rows={12}
              value={result.body}
              onChange={(e) =>
                onUpdateResult({ ...result, body: e.target.value })
              }
              className="w-full flex-1 text-sm text-slate-800 bg-white border border-slate-100 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans leading-relaxed selection:bg-blue-100"
              placeholder="Your email draft will appear here..."
            />
          </div>

          {/* Quick AI Refinements Toolbar */}
          <div className="border-t border-slate-200 p-3 sm:px-6 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-blue-600" />
                <span>One-Click Smart Refinements</span>
              </span>
              {isRefining && (
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
                  <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  Refining...
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-1.5">
              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('shorter')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Trim filler and make it punchy"
              >
                <Scissors className="w-3 h-3 text-slate-500" />
                <span>Make Shorter</span>
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('more_assertive')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
                title="More confident, decisive, and authoritative"
              >
                More Assertive
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('more_diplomatic')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
                title="Softer phrasing, collaborative and constructive"
              >
                More Diplomatic
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('more_formal')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
                title="Elevate to executive board standard"
              >
                Executive Polish
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('more_friendly')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
                title="Warmer and more approachable"
              >
                More Friendly
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('add_bullet_points')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Organize key takeaways into clean bullet points"
              >
                <ListOrdered className="w-3 h-3 text-slate-500" />
                <span>Add Bullets</span>
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('strengthen_cta')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Make next step & response action unmistakable"
              >
                <ArrowRight className="w-3 h-3 text-blue-600" />
                <span>Sharpen CTA</span>
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine('fix_grammar')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Check grammar, flow, and sentence polish"
              >
                <CheckCheck className="w-3 h-3 text-emerald-600" />
                <span>Proofread</span>
              </button>

              <button
                type="button"
                disabled={isRefining}
                onClick={() => setShowTranslateModal(true)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                title="Translate into another language"
              >
                <Languages className="w-3 h-3 text-slate-500" />
                <span>Translate...</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-md transition-colors flex items-center gap-1"
                title="Custom instruction to modify draft"
              >
                <Edit3 className="w-3 h-3" />
                <span>Custom Instruction</span>
              </button>
            </div>

            {/* Custom instruction prompt bar */}
            {showCustomPrompt && (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customPromptText.trim()) {
                      onRefine('custom', { customInstruction: customPromptText.trim() });
                      setCustomPromptText('');
                      setShowCustomPrompt(false);
                    }
                  }}
                  placeholder="e.g. Mention that I will be out of office on Friday, or frame it around our Q3 budget constraints..."
                  className="flex-1 text-xs bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  disabled={!customPromptText.trim() || isRefining}
                  onClick={() => {
                    if (customPromptText.trim()) {
                      onRefine('custom', { customInstruction: customPromptText.trim() });
                      setCustomPromptText('');
                      setShowCustomPrompt(false);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strategic Variations Tab */}
      {activeTab === 'variations' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                3 Strategic Style Variations
              </h4>
              <p className="text-xs text-slate-500">
                Compare different approaches for the same topic and apply the best fit with 1-click.
              </p>
            </div>
            <button
              type="button"
              disabled={isLoadingVariations}
              onClick={onFetchVariations}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingVariations ? 'animate-spin' : ''}`}
              />
              <span>Regenerate Takes</span>
            </button>
          </div>

          {isLoadingVariations ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-600 font-medium">
                Generating 3 distinct strategic drafts...
              </p>
            </div>
          ) : variations && variations.length > 0 ? (
            <div className="space-y-4">
              {variations.map((v, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {v.label}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {v.styleDescription} · {v.wordCount} words
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateResult({
                          ...result,
                          subject: v.subject,
                          body: v.body,
                        });
                        setActiveTab('draft');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-md transition-colors"
                    >
                      Use This Version
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mb-1.5">
                    Subject: {v.subject}
                  </div>
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed max-h-48 overflow-y-auto">
                    {v.body}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No variations loaded yet. Click "Regenerate Takes" to craft 3 versions.
            </div>
          )}
        </div>
      )}

      {/* Tone & Executive Audit Tab */}
      {activeTab === 'audit' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              Executive Communication Audit
            </h4>
            <p className="text-xs text-slate-500">
              Objective evaluation of formality, readability, and effectiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 block mb-1">
                Formality Index
              </span>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {result.toneAnalysis?.formalityScore}%
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${result.toneAnalysis?.formalityScore || 50}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">
                {result.toneAnalysis?.detectedTone || formData.tone}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 block mb-1">
                Readability Level
              </span>
              <div className="text-lg font-bold text-slate-900 mb-1">
                {result.toneAnalysis?.readabilityLevel || 'Clear & Accessible'}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Target audience: {formData.recipient}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500 block mb-1">
                Estimated Reading Time
              </span>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                ~{readSec}s
              </div>
              <span className="text-[11px] text-slate-500 block">
                {wordCount} words (ideal for busy readers)
              </span>
            </div>
          </div>

          {/* Coaching tips */}
          {result.toneAnalysis?.coachingTips && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Executive Strategy Tips</span>
              </h5>
              <div className="space-y-2">
                {result.toneAnalysis.coachingTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 text-xs text-slate-700 bg-blue-50/50 border border-blue-100 rounded-lg flex items-start gap-2"
                  >
                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Studio Footer Action Bar */}
      <div className="border-t border-slate-200 p-4 sm:px-6 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* Copy Email Body Button */}
          <button
            type="button"
            onClick={handleCopyBody}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            {copiedBody ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Email</span>
              </>
            )}
          </button>

          {/* Open in Mail Client */}
          <a
            href={createMailtoUrl('', result.subject, result.body)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Open in Mail App</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {/* Save to Drafts */}
          <button
            type="button"
            onClick={handleSaveToDrafts}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Saved!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </>
            )}
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    downloadAsEml(result.subject, result.body);
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-700 flex items-center justify-between"
                >
                  <span>Download .EML</span>
                  <span className="text-[10px] text-slate-400">Outlook/Apple</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fullText = `Subject: ${result.subject}\n\n${result.body}`;
                    downloadAsFile(
                      `${(result.subject || 'email').slice(0, 25)}.txt`,
                      fullText
                    );
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-700 flex items-center justify-between"
                >
                  <span>Download .TXT</span>
                  <span className="text-[10px] text-slate-400">Plain text</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Translation Popover Modal */}
      {showTranslateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Translate Email
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowTranslateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Translate your draft with culturally authentic business etiquette.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setShowTranslateModal(false);
                    onRefine('translate', { targetLanguage: lang });
                  }}
                  className="p-2 text-left text-xs font-medium text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
