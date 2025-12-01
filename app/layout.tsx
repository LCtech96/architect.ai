import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Architect.ai',
  description: 'An iOS-style AI app builder',
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
            body {
              background-color: #F5F5F7;
              color: #1D1D1F;
              overflow: hidden;
            }
            .dark body {
              background-color: #111827;
              color: #F9FAFB;
            }
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
