import type { SavedEmail } from '../types';

export function calculateWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadTimeSeconds(wordCount: number): number {
  // Average reading speed is ~200-250 words per minute -> ~3.5 words/sec
  return Math.max(5, Math.round(wordCount / 3.5));
}

export function createMailtoUrl(to: string = '', subject: string, body: string): string {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  return `mailto:${to}?${params.toString()}`;
}

export function downloadAsFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAsEml(subject: string, body: string, recipientEmail: string = '', senderEmail: string = '') {
  const dateStr = new Date().toUTCString();
  const emlContent = [
    `From: ${senderEmail || 'user@example.com'}`,
    `To: ${recipientEmail || 'recipient@example.com'}`,
    `Subject: ${subject}`,
    `Date: ${dateStr}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n');

  const safeTitle = (subject || 'email-draft')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 30);
  downloadAsFile(`${safeTitle}.eml`, emlContent, 'message/rfc822');
}

const STORAGE_KEY = 'mailcraft_saved_drafts';

export function getSavedDrafts(): SavedEmail[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDraft(draft: Omit<SavedEmail, 'id' | 'createdAt'>): SavedEmail {
  const drafts = getSavedDrafts();
  const newDraft: SavedEmail = {
    ...draft,
    id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };
  const updated = [newDraft, ...drafts];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not save to localStorage', e);
  }
  return newDraft;
}

export function deleteDraft(id: string): SavedEmail[] {
  const drafts = getSavedDrafts();
  const updated = drafts.filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not update localStorage', e);
  }
  return updated;
}

export function toggleStarDraft(id: string): SavedEmail[] {
  const drafts = getSavedDrafts();
  const updated = drafts.map((d) => (d.id === id ? { ...d, isStarred: !d.isStarred } : d));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Could not update localStorage', e);
  }
  return updated;
}
