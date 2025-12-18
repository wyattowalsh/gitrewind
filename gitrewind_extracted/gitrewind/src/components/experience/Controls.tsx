'use client';

import type { UnifiedParameters } from '@/types/parameters';
import { Share2, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import { useUIStore } from '@/stores/ui';

interface ControlsProps {
  params: UnifiedParameters;
}

export function Controls({ params }: ControlsProps) {
  const { openModal } = useUIStore();

  return (
    <div className="absolute bottom-24 right-4 md:right-6 z-20">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openModal('share')}
          className="glass"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => openModal('export')}
          className="glass"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => openModal('settings')}
          className="glass"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
