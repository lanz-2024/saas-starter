import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/components/providers/TRPCProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'SaaS Starter', template: '%s | SaaS Starter' },
  description: 'Modern SaaS starter with auth, billing, and teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
