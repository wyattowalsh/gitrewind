'use client';

import { useState, useCallback } from 'react';
import type { UnifiedParameters } from '@/types/parameters';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui';
import { useUIStore } from '@/stores/ui';
import { useExportStore, toast } from '@/stores';
import { useEventBus } from '@/hooks/useEventBus';
import { downloadBlob, exportVideo } from '@/lib/export/video';
import { exportImage } from '@/lib/export/image';
import { exportAudio } from '@/lib/export/audio';
import { X, Video, Image, Music, AlertCircle } from 'lucide-react';

interface ExportDialogProps {
  params: UnifiedParameters;
}

type ExportType = 'video' | 'image' | 'audio';

// Resolution presets
const IMAGE_RESOLUTIONS = {
  square: { width: 1080, height: 1080, label: '1080x1080 (Square)' },
  portrait: { width: 1080, height: 1920, label: '1080x1920 (Portrait)' },
  landscape: { width: 1920, height: 1080, label: '1920x1080 (Landscape)' },
  '4k': { width: 3840, height: 2160, label: '4K (3840x2160)' },
};

type ResolutionKey = keyof typeof IMAGE_RESOLUTIONS;

export function ExportDialog({ params }: ExportDialogProps) {
  const { modals, closeModal } = useUIStore();
  const artCanvas = useExportStore((state) => state.artCanvas);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<ExportType>('image');
  const [selectedResolution, setSelectedResolution] = useState<ResolutionKey>('landscape');
  const [error, setError] = useState<string | null>(null);

  useEventBus('export:progress', ({ progress: p }) => {
    setProgress(p);
  });

  useEventBus('export:complete', ({ blob, format }) => {
    setIsExporting(false);
    setProgress(0);
    setError(null);

    // Generate filename
    const ext = format.includes('video') ? 'webm' : format.includes('audio') ? 'wav' : 'png';
    const filename = `gitrewind-${params.username}-${params.year}.${ext}`;
    downloadBlob(blob, filename);

    toast.success('Export complete!', `Your ${selectedType} has been downloaded.`);
    closeModal('export');
  });

  useEventBus('export:error', ({ error: err }) => {
    setIsExporting(false);
    setProgress(0);
    setError(err?.message ?? 'Export failed. Please try again.');
    toast.error('Export failed', err?.message ?? 'Please try again.');
  });

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setProgress(0);
    setError(null);

    try {
      if (selectedType === 'image') {
        if (!artCanvas) {
          throw new Error('Canvas not available. Please wait for the visualization to load.');
        }

        const resolution = IMAGE_RESOLUTIONS[selectedResolution];

        // Create a scaled canvas for export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = resolution.width;
        exportCanvas.height = resolution.height;

        const ctx = exportCanvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to create export canvas context.');
        }

        // Draw the art canvas scaled to the export resolution
        ctx.drawImage(artCanvas, 0, 0, resolution.width, resolution.height);

        // Export the scaled canvas
        await exportImage({ canvas: exportCanvas });
      } else if (selectedType === 'video') {
        if (!artCanvas) {
          throw new Error('Canvas not available. Please wait for the visualization to load.');
        }

        // Get player duration (90 seconds is the full composition)
        const duration = 90;

        // Start recording
        await exportVideo({
          canvas: artCanvas,
          duration,
          fps: 30,
        });
      } else if (selectedType === 'audio') {
        // Get player duration (90 seconds is the full composition)
        const duration = 90;

        // Audio export requires playback to be active
        toast.info('Recording audio...', 'Please ensure music is playing. Recording will last 90 seconds.');

        await exportAudio({ duration });
      }
    } catch (err) {
      setIsExporting(false);
      setProgress(0);
      const errorMessage = err instanceof Error ? err.message : 'Export failed. Please try again.';
      setError(errorMessage);
      toast.error('Export failed', errorMessage);
    }
  }, [selectedType, selectedResolution, artCanvas]);

  if (!modals.export) return null;

  const exportOptions = [
    {
      type: 'video' as const,
      icon: Video,
      label: 'Video',
      description: '90s WebM video',
      available: !!artCanvas,
    },
    {
      type: 'image' as const,
      icon: Image,
      label: 'Image',
      description: 'PNG screenshot',
      available: !!artCanvas,
    },
    {
      type: 'audio' as const,
      icon: Music,
      label: 'Audio',
      description: 'WAV audio',
      available: true,
    },
  ];

  const canExport = selectedType === 'audio' || !!artCanvas;

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
                disabled={isExporting || !option.available}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedType === option.type
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option.icon
                  className={`w-6 h-6 mx-auto mb-2 ${
                    selectedType === option.type ? 'text-blue-400' : 'text-gray-400'
                  }`}
                />
                <p className="text-sm font-medium text-white">{option.label}</p>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              </button>
            ))}
          </div>

          {/* Resolution selector for images */}
          {selectedType === 'image' && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Resolution</label>
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value as ResolutionKey)}
                disabled={isExporting}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {Object.entries(IMAGE_RESOLUTIONS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duration info for video/audio */}
          {(selectedType === 'video' || selectedType === 'audio') && (
            <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                {selectedType === 'video'
                  ? 'Video export will record 90 seconds of the visualization. This may take a while.'
                  : 'Audio export requires music to be playing. It will record 90 seconds of audio output.'}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

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
            disabled={isExporting || !canExport}
            isLoading={isExporting}
            className="w-full"
          >
            {isExporting
              ? 'Exporting...'
              : `Export ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
          </Button>

          {/* Canvas not available warning */}
          {!artCanvas && selectedType !== 'audio' && (
            <p className="text-xs text-amber-400 text-center">
              Visualization canvas not ready. Please wait or switch to Art view.
            </p>
          )}

          {/* Note */}
          <p className="text-xs text-gray-500 text-center">
            Export may take a few seconds depending on the format and duration.
          </p>
        </div>
      </div>
    </div>
  );
}
