import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Architect.ai',
  description: 'An iOS-style AI app builder',
  appleWebApp: {
    capable: true,
    title: 'Architect',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F5F7' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                      apple: {
                        gray: '#F5F5F7',
                        blue: '#007AFF',
                        dark: '#1D1D1F',
                      }
                    }
                  },
                },
              }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
      :root {
        --app-height: 100vh;
      }
      @supports (height: 100dvh) {
        :root { --app-height: 100dvh; }
      }
      html, body {
        height: 100%;
      }
      body {
        background-color: #F5F5F7;
        color: #1D1D1F;
        overflow: hidden; /* Prevent body scroll, handle in app */
        overscroll-behavior: none; /* No rubber-band bounce of the whole app on iOS */
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
      }
      .dark body {
        background-color: #111827;
        color: #F9FAFB;
      }
      /* Removes the double-tap-to-zoom delay on iOS */
      button, a, input, label, [role="button"] {
        touch-action: manipulation;
      }
      /* Full visible height; updated from visualViewport while the iOS keyboard is open */
      .app-height {
        height: var(--app-height);
      }
      /* Safe areas for notch / Dynamic Island / home indicator (needs viewport-fit=cover) */
      .safe-top { padding-top: env(safe-area-inset-top); }
      .safe-left { padding-left: env(safe-area-inset-left); }
      .safe-right { padding-right: env(safe-area-inset-right); }
      .safe-pb { padding-bottom: env(safe-area-inset-bottom); }
      .safe-bottom { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
      @media (min-width: 768px) {
        .safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      /* Custom Scrollbar for sleek look */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent; 
      }
      ::-webkit-scrollbar-thumb {
        background: #D1D1D6; 
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #8E8E93; 
      }
      .dark ::-webkit-scrollbar-thumb {
        background: #4B5563;
      }
      .dark ::-webkit-scrollbar-thumb:hover {
        background: #6B7280;
      }
          `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
