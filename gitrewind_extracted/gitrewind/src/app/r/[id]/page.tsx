'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { decodeShareData } from '@/lib/export/share';
import { Button } from '@/components/ui';
import { Github, ExternalLink } from 'lucide-react';
import type { HSL } from '@/types/parameters';

function parseHSL(str: string): HSL {
  const [h, s, l] = str.split(',').map(Number);
  return { h: h ?? 200, s: s ?? 60, l: l ?? 50 };
}

export default function SharedPage() {
  const params = useParams();
  const [data, setData] = useState<ReturnType<typeof decodeShareData>>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) {
      setError(true);
      return;
    }

    const decoded = decodeShareData(id);
    if (!decoded) {
      setError(true);
      return;
    }

    setData(decoded);
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
          <p className="text-gray-400 mb-6">This link appears to be invalid or expired.</p>
          <Button onClick={() => window.location.href = '/'}>
            Create Your Own
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  const primaryColor = parseHSL(data.p);
  const bgStyle = {
    background: `linear-gradient(135deg, hsl(${primaryColor.h}, 30%, 10%) 0%, hsl(${primaryColor.h + 30}, 20%, 5%) 100%)`,
  };

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ background: `hsla(${primaryColor.h}, 50%, 50%, 0.1)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ background: `hsla(${primaryColor.h + 60}, 50%, 50%, 0.1)` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {data.y} Rewind
            </h1>
            <p className="text-xl text-gray-300">
              @{data.u}
            </p>
          </div>

          {/* Stats card */}
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{data.tc.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Commits</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{data.ad}</p>
                <p className="text-sm text-gray-400">Active Days</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{data.ls}</p>
                <p className="text-sm text-gray-400">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{data.tl}</p>
                <p className="text-sm text-gray-400">Top Language</p>
              </div>
            </div>

            {/* Musical info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tempo</span>
                <span className="text-white">{data.t} BPM</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">Key</span>
                <span className="text-white">{data.k}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-400">Visual Style</span>
                <span className="text-white capitalize">{data.a}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <Github className="w-5 h-5 mr-2" />
              Create Your Own Rewind
            </Button>

            <Button
              onClick={() => window.open(`https://github.com/${data.u}`, '_blank')}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View GitHub Profile
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Git Rewind &mdash; Your code. Your story. Your symphony.
          </p>
        </div>
      </div>
    </div>
  );
}
