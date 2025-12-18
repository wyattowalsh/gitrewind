import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Git Rewind - Your code. Your story. Your symphony.',
  description: 'Transform your year of GitHub activity into an immersive, multi-sensory experience with 3D visualizations, generative music, and shader-powered art.',
  keywords: ['GitHub', 'Year in Review', 'Visualization', 'Generative Music', 'Developer Tools'],
  authors: [{ name: 'Git Rewind' }],
  openGraph: {
    title: 'Git Rewind',
    description: 'Your code. Your story. Your symphony.',
    url: 'https://gitrewind.com',
    siteName: 'Git Rewind',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Git Rewind',
    description: 'Your code. Your story. Your symphony.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-gray-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
