import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from './loading';

export const metadata: Metadata = {
  title: {
    template: 'Matcha | %s',
    default: 'Matcha',
  },
  description: 'The official website for Matcha, a talent matching platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
