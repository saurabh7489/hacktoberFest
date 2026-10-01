import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmailComposer } from './components/EmailComposer';
import { EmailStudio } from './components/EmailStudio';
import { TemplatesModal } from './components/TemplatesModal';
import { SavedDraftsModal } from './components/SavedDraftsModal';
import type {
  EmailTone,
  RecipientType,
  EmailIntent,
  EmailLength,
  EmailResult,
  EmailVariation,
  SavedEmail,
} from './types';
import type { EmailTemplate } from './data/templates';
import {
  getSavedDrafts,
  saveDraft,
  deleteDraft,
  toggleStarDraft,
} from './utils/emailUtils';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'compose' | 'reply'>('compose');

  const [formData, setFormData] = useState({
    description: '',
    tone: 'Executive / Formal' as EmailTone,
    recipient: 'Boss / Senior Executive' as RecipientType,
    intent: 'Action Request / Ask' as EmailIntent,
    length: 'balanced' as EmailLength,
    senderName: '',
    recipientName: '',
    keyPoints: [] as string[],
    originalEmail: '',
    replyAction: 'general' as 'agree' | 'decline' | 'clarify' | 'counter' | 'general',
  });

  const [result, setResult] = useState<EmailResult | null>(null);
  const [variations, setVariations] = useState<EmailVariation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [refinementSummary, setRefinementSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedEmail[]>([]);

  // Load saved drafts on mount
  useEffect(() => {
    setSavedDrafts(getSavedDrafts());
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.description.trim()) {
      setErrorMessage('Please enter a brief description or notes for the email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRefinementSummary(null);
    setVariations(null);

    try {
      const response = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          tone: formData.tone,
          recipient: formData.recipient,
          intent: formData.intent,
          length: formData.length,
          senderName: formData.senderName,
          recipientName: formData.recipientName,
          keyPoints: formData.keyPoints,
          isReply: mode === 'reply',
          originalEmail: formData.originalEmail,
          replyAction: formData.replyAction,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong while generating the email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (
    action: string,
    extra?: { targetLanguage?: string; customInstruction?: string }
  ) => {
    if (!result?.body) return;

    setIsRefining(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/email/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSubject: result.subject,
          currentBody: result.body,
          action,
          targetLanguage: extra?.targetLanguage,
          customInstruction: extra?.customInstruction,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine email');
      }

      setResult((prev) => (prev ? { ...prev, subject: data.subject, body: data.body } : null));
      setRefinementSummary(data.changeSummary || 'Draft refined successfully.');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to refine email draft.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleFetchVariations = async () => {
    if (!formData.description.trim() && !result?.body) return;

    setIsLoadingVariations(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/email/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description || result?.body || '',
          recipient: formData.recipient,
          intent: formData.intent,
          senderName: formData.senderName,
          recipientName: formData.recipientName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate variations');
      }

      setVariations(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to fetch alternative takes.');
    } finally {
      setIsLoadingVariations(false);
    }
  };

  const handleSaveDraft = (title: string) => {
    if (!result) return;
    const newDraft = saveDraft({
      title: title || result.subject || 'Email Draft',
      subject: result.subject,
      body: result.body,
      tone: formData.tone,
      recipient: formData.recipient,
      intent: formData.intent,
    });
    setSavedDrafts(getSavedDrafts());
  };

  const handleDeleteDraft = (id: string) => {
    const updated = deleteDraft(id);
    setSavedDrafts(updated);
  };

  const handleToggleStar = (id: string) => {
    const updated = toggleStarDraft(id);
    setSavedDrafts(updated);
  };

  const handleLoadDraft = (draft: SavedEmail) => {
    setFormData((prev) => ({
      ...prev,
      tone: draft.tone,
      recipient: draft.recipient,
      intent: draft.intent,
    }));
    setResult({
      subject: draft.subject,
      subjectAlternatives: [],
      body: draft.body,
      toneAnalysis: {
        detectedTone: draft.tone,
        formalityScore: 75,
        wordCount: draft.body.split(/\s+/).length,
        estimatedReadTimeSec: Math.round(draft.body.split(/\s+/).length / 3.5),
        readabilityLevel: 'Standard',
        coachingTips: ['Loaded from your saved drafts.'],
      },
    });
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setMode('compose');
    setFormData((prev) => ({
      ...prev,
      description: template.notes,
      tone: template.tone,
      recipient: template.recipient,
      intent: template.intent,
      length: template.length,
      keyPoints: template.keyPoints || [],
    }));
  };

  const handleApplyTemplateSnippet = (snippet: {
    notes: string;
    tone: EmailTone;
    intent: EmailIntent;
  }) => {
    setFormData((prev) => ({
      ...prev,
      description: snippet.notes,
      tone: snippet.tone,
      intent: snippet.intent,
    }));
  };

  const handleReset = () => {
    setFormData({
      description: '',
      tone: 'Executive / Formal',
      recipient: 'Boss / Senior Executive',
      intent: 'Action Request / Ask',
      length: 'balanced',
      senderName: '',
      recipientName: '',
      keyPoints: [],
      originalEmail: '',
      replyAction: 'general',
    });
    setResult(null);
    setVariations(null);
    setRefinementSummary(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* Top Header */}
      <Header
        mode={mode}
        setMode={setMode}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenDrafts={() => setShowDraftsModal(true)}
        savedCount={savedDrafts.length}
        onReset={handleReset}
      />

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form (5 cols on lg) */}
          <div className="lg:col-span-5">
            <EmailComposer
              mode={mode}
              formData={formData}
              setFormData={setFormData}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              onApplyTemplateSnippet={handleApplyTemplateSnippet}
            />
          </div>

          {/* Right Column: Studio / Editor / Variations (7 cols on lg) */}
          <div className="lg:col-span-7">
            <EmailStudio
              result={result}
              onUpdateResult={setResult}
              isLoading={isLoading}
              onRefine={handleRefine}
              isRefining={isRefining}
              refinementSummary={refinementSummary}
              variations={variations}
              isLoadingVariations={isLoadingVariations}
              onFetchVariations={handleFetchVariations}
              onSaveDraft={handleSaveDraft}
              formData={formData}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <SavedDraftsModal
        isOpen={showDraftsModal}
        onClose={() => setShowDraftsModal(false)}
        drafts={savedDrafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onToggleStar={handleToggleStar}
      />
    </div>
  );
}
