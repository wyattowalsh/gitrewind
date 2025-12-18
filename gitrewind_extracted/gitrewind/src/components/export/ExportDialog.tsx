'use client';

import { useState } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui';
import { useUIStore } from '@/stores/ui';
import { useEventBus } from '@/hooks/useEventBus';
import { downloadBlob } from '@/lib/export/video';
import { X, Video, Image, Music } from 'lucide-react';

interface ExportDialogProps {
  params: UnifiedParameters;
}

type ExportType = 'video' | 'image' | 'audio';

export function ExportDialog({ params }: ExportDialogProps) {
  const { modals, closeModal } = useUIStore();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<ExportType>('image');

  useEventBus('export:progress', ({ progress: p }) => {
    setProgress(p);
  });

  useEventBus('export:complete', ({ blob, format }) => {
    setIsExporting(false);
    setProgress(0);

    // Generate filename
    const ext = format.includes('video') ? 'webm' : format.includes('audio') ? 'wav' : 'png';
    const filename = `gitrewind-${params.username}-${params.year}.${ext}`;
    downloadBlob(blob, filename);
  });

  useEventBus('export:error', () => {
    setIsExporting(false);
    setProgress(0);
    alert('Export failed. Please try again.');
  });

  if (!modals.export) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    // For now, just show a message - actual export would need canvas reference
    setTimeout(() => {
      setIsExporting(false);
      alert('Export feature requires canvas integration. Try using the Share feature instead!');
    }, 1000);
  };

  const exportOptions = [
    { type: 'video' as const, icon: Video, label: 'Video', description: 'WebM video with audio' },
    { type: 'image' as const, icon: Image, label: 'Image', description: 'PNG screenshot' },
    { type: 'audio' as const, icon: Music, label: 'Audio', description: 'WAV audio only' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !isExporting && closeModal('export')}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Export Your Rewind</h2>
          <button
            onClick={() => closeModal('export')}
            disabled={isExporting}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Export type selection */}
          <div className="grid grid-cols-3 gap-2">
            {exportOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                disabled={isExporting}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedType === option.type
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                } disabled:opacity-50`}
              >
                <option.icon className={`w-6 h-6 mx-auto mb-2 ${
                  selectedType === option.type ? 'text-blue-400' : 'text-gray-400'
                }`} />
                <p className="text-sm font-medium text-white">{option.label}</p>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              </button>
            ))}
          </div>

          {/* Progress */}
          {isExporting && (
            <div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-gray-400 text-center">
                Exporting... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Export button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            isLoading={isExporting}
            className="w-full"
          >
            {isExporting ? 'Exporting...' : `Export ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
          </Button>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center">
            Export may take a few seconds depending on the duration.
          </p>
        </div>
      </div>
    </div>
  );
}
