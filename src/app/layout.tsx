import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@components/providers';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from 'next-themes';
import { Toast } from '@ui/toast';
import { Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import Favicon from '@/assets/icons/favicon.png';
import FaviconDark from '@/assets/icons/favicon-dark.png';

export const runtime = 'edge';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
export const metadata: Metadata = {
  title: 'Wecare - Your Health, Our Priority',
  description:
    'Wecare is a modern telemedicine platform connecting patients with expert doctors for convenient, high-quality healthcare consultations.',
  icons: [
    {
      rel: 'icon',
      media: '(prefers-color-scheme: dark)',
      url: Favicon.src,
    },
    {
      rel: 'icon',
      media: '(prefers-color-scheme: light)',
      url: FaviconDark.src,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${inter.variable} ${GeistMono.variable} font-sans`}>
        <Providers>
          <ThemeProvider disableTransitionOnChange attribute="class">
            {children}
          </ThemeProvider>
          <Toast />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
