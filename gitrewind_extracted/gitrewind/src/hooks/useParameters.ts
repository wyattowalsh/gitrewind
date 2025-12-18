// Parameters Hook
'use client';

import { useParamsStore, getMergedParams } from '@/stores/params';
import type { UnifiedParameters } from '@/types/parameters';

export function useParameters(): UnifiedParameters | null {
  const state = useParamsStore();
  return getMergedParams(state);
}

export function useParametersStatus() {
  return useParamsStore((state) => state.status);
}
