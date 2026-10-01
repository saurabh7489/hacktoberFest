import React from 'react';
import { Mail, Sparkles, Bookmark, LayoutTemplate, RotateCcw, Reply, PlusCircle } from 'lucide-react';

interface HeaderProps {
  mode: 'compose' | 'reply';
  setMode: (mode: 'compose' | 'reply') => void;
  onOpenTemplates: () => void;
  onOpenDrafts: () => void;
  savedCount: number;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  onOpenTemplates,
  onOpenDrafts,
  savedCount,
  onReset,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-lg">
                MailCraft <span className="text-blue-600 font-bold">AI</span>
              </span>
              <span className="text-[11px] font-medium text-slate-700 tracking-wide uppercase">
                Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Professional email generation tailored to tone, recipient & intent
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => setMode('compose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'compose'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>New Email</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('reply')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'reply'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Reply className="w-3.5 h-3.5 text-indigo-600" />
            <span>Reply Assistant</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Browse pre-built email templates"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            type="button"
            onClick={onOpenDrafts}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors relative"
            title="View saved email drafts"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Saved Drafts</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-semibold rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Clear all fields and reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
