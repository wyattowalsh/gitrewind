'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { useParamsStore } from '@/stores/params';
import { fetchGitHubData } from '@/lib/data/github';
import { transformToActivityModel } from '@/lib/data/transform';
import { computeParameters } from '@/lib/core/parameters';
import { LoadingScreen } from '@/components/experience';
import { ExperienceView } from '@/components/experience/ExperienceView';

function WrappedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthenticated, token, user, status: authStatus } = useAuthStore();
  const { setReady: setDataReady, setError, status: dataStatus, model } = useDataStore();
  const { setReady: setParamsReady, setComputing, values: params } = useParamsStore();
  const [initialized, setInitialized] = useState(false);

  // Handle auth data from URL
  useEffect(() => {
    const authData = searchParams.get('auth');
    if (authData && !token) {
      try {
        const decoded = JSON.parse(atob(authData)) as {
          token: string;
          user: { login: string; name: string | null; avatarUrl: string; bio: string | null };
        };
        setAuthenticated(decoded.token, decoded.user);

        // Clear the auth param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.error('Failed to parse auth data:', e);
        router.push('/?error=auth_failed');
      }
    }
    setInitialized(true);
  }, [searchParams, token, setAuthenticated, router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (!initialized || !token || !user || dataStatus !== 'idle') return;

    const fetchData = async () => {
      try {
        const rawData = await fetchGitHubData(token, user.login);
        const activityModel = transformToActivityModel(rawData);
        setDataReady(activityModel);

        // Compute parameters
        setComputing();
        const unifiedParams = computeParameters(activityModel);
        setParamsReady(unifiedParams);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError(error instanceof Error ? error : new Error('Failed to fetch data'));
      }
    };

    fetchData();
  }, [initialized, token, user, dataStatus, setDataReady, setError, setComputing, setParamsReady]);

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !token && authStatus === 'idle') {
      router.push('/');
    }
  }, [initialized, token, authStatus, router]);

  // Show loading screen while fetching
  if (!initialized || dataStatus === 'idle' || dataStatus === 'fetching' || dataStatus === 'transforming') {
    return <LoadingScreen />;
  }

  // Show error state
  if (dataStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-6">Failed to fetch your GitHub data.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show experience
  if (dataStatus === 'ready' && params && model) {
    return <ExperienceView params={params} model={model} />;
  }

  return <LoadingScreen />;
}

export default function WrappedPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WrappedContent />
    </Suspense>
  );
}
