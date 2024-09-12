import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@components/providers';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from 'next-themes';
import { Toast } from '@ui/toast';
import { Inter } from 'next/font/google';

export const runtime = 'edge';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
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
      </body>
    </html>
  );
}
