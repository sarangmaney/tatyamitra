import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Geist_Mono removed as only Geist Sans is explicitly requested
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Harit Mitra',
  description: 'Empowering agricultural communities through shared resources.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
