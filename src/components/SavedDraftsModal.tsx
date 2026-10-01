import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Trash2,
  Star,
  Copy,
  Check,
  ExternalLink,
  Search,
  ArrowRight,
} from 'lucide-react';
import type { SavedEmail } from '../types';
import { createMailtoUrl, calculateWordCount } from '../utils/emailUtils';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedEmail[];
  onLoadDraft: (draft: SavedEmail) => void;
  onDeleteDraft: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export const SavedDraftsModal: React.FC<SavedDraftsModalProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onToggleStar,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = drafts.filter((d) => {
    const matchesSearch =
      d.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStar = !onlyStarred || d.isStarred;
    return matchesSearch && matchesStar;
  });

  const handleCopyBody = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Saved Email Drafts
              </h3>
              <p className="text-xs text-slate-500">
                Access, copy, or reload your saved drafts anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved drafts..."
              className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              onlyStarred
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
              }`}
            />
            <span>Starred Only</span>
          </button>
        </div>

        {/* Drafts List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No saved drafts found. When you generate an email you love, click "Save Draft" in the studio!
            </div>
          ) : (
            filtered.map((draft) => {
              const words = calculateWordCount(draft.body);
              const dateStr = new Date(draft.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={draft.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium text-blue-600">
                          {draft.tone}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500">
                          {draft.recipient}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400">
                          {dateStr}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400">
                          {words} words
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {draft.subject}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleStar(draft.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md transition-colors"
                        title="Star draft"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            draft.isStarred ? 'fill-amber-400 text-amber-500' : ''
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-24 overflow-y-auto leading-relaxed">
                    {draft.body}
                  </pre>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyBody(draft.id, draft.body)}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                      >
                        {copiedId === draft.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <span className="text-slate-300">|</span>
                      <a
                        href={createMailtoUrl('', draft.subject, draft.body)}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Mail</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadDraft(draft);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      <span>Load in Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
