'use client';

import { useState } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores/ui';
import { createShareUrl, copyToClipboard, shareToTwitter, shareToLinkedIn } from '@/lib/export/share';
import { X, Copy, Twitter, Linkedin, Check } from 'lucide-react';

interface ShareDialogProps {
  params: UnifiedParameters;
}

export function ShareDialog({ params }: ShareDialogProps) {
  const { modals, closeModal } = useUIStore();
  const [copied, setCopied] = useState(false);

  if (!modals.share) return null;

  const shareUrl = createShareUrl(params);

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => closeModal('share')}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Share Your Rewind</h2>
          <button
            onClick={() => closeModal('share')}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* URL */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Shareable Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm truncate"
              />
              <Button onClick={handleCopy} variant="secondary" size="sm">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Social buttons */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Share on Social</label>
            <div className="flex gap-2">
              <Button
                onClick={() => shareToTwitter(params)}
                variant="outline"
                className="flex-1"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => shareToLinkedIn(params)}
                variant="outline"
                className="flex-1"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Stats preview */}
          <div className="p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-300">
              {params.year} Rewind for <span className="font-bold text-white">@{params.username}</span>
            </p>
            <div className="mt-2 flex gap-4 text-xs text-gray-400">
              <span>{params.stats.totalCommits.toLocaleString()} commits</span>
              <span>{params.stats.activeDays} days</span>
              <span>{params.stats.topLanguage}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
