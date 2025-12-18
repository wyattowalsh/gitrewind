import { Hero, Features } from '@/components/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Hero />
      <Features />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Git Rewind &mdash; Your code. Your story. Your symphony.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            100% client-side. Open source. No data stored.
          </p>
        </div>
      </footer>
    </main>
  );
}
