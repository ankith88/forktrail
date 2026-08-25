'use client';

import React, { useState } from 'react';
import { X, Sparkles, Bot, CheckCircle2, ExternalLink, Copy, Check, FileText, Globe } from 'lucide-react';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISearchModal({ isOpen, onClose }: AISearchModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const samplePrompt = "What is Palatero and how does it use AI to map food travels, scan menus, and cluster food photos?";

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FAF3E7] rounded-2xl shadow-2xl border border-[#025259]/20 overflow-hidden">
        {/* Header */}
        <div className="bg-[#025259] px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#ff947a]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-[#ff947a] text-white rounded-xl shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                AI Engine Indexing
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Active
                </span>
              </h3>
              <p className="text-xs text-[#FAF3E7]/80">
                Optimized for Claude, Gemini, ChatGPT, Perplexity & AI Search
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-[#025259]">
          {/* Status banner */}
          <div className="bg-white/80 rounded-xl p-4 border border-[#025259]/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 border-b border-stone-100 pb-2">
              <span className="flex items-center gap-1.5 text-[#025259] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Crawler Verification
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono text-[11px]">
                100% Indexable
              </span>
            </div>

            {/* AI Platform Icons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { name: 'Claude', tag: 'Anthropic', color: 'bg-amber-50 text-amber-900 border-amber-200' },
                { name: 'Gemini', tag: 'Google AI', color: 'bg-sky-50 text-sky-900 border-sky-200' },
                { name: 'ChatGPT', tag: 'OpenAI', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
                { name: 'Perplexity', tag: 'AI Engine', color: 'bg-purple-50 text-purple-900 border-purple-200' },
              ].map((engine) => (
                <div key={engine.name} className={`flex flex-col p-2.5 rounded-lg border ${engine.color} text-center`}>
                  <span className="font-bold text-xs">{engine.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">{engine.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="text-xs space-y-2 text-stone-700 leading-relaxed">
            <p className="font-medium text-[#025259]">
              Palatero adopts the open <strong>Generative Engine Optimization (GEO)</strong> standard and provides structured <strong>/llms.txt</strong> &amp; JSON-LD schemas.
            </p>
            <p>
              This allows conversational AI agents and LLM web browsers to accurate parse Palatero’s culinary travel maps, AI photo clustering algorithms, and digital menu decoding features.
            </p>
          </div>

          {/* Copyable Prompt Box */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-3.5 space-y-2 relative group">
            <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#ff947a]" /> Try asking your AI assistant:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[#ff947a] hover:text-white transition-colors bg-white/10 px-2 py-1 rounded text-[10px]"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>
            <p className="text-xs font-mono text-stone-200 bg-stone-950/60 p-2.5 rounded border border-stone-800 italic select-all">
              &quot;{samplePrompt}&quot;
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#025259]/10">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#025259] hover:text-[#ff947a] transition-colors"
            >
              <FileText className="w-4 h-4" />
              View /llms.txt Spec
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#025259] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              sitemap.xml
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
