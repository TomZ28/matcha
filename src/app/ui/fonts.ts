import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });

export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});

// Utility function to provide heading styles with Inter instead of Lusitana
export const getHeadingStyles = (size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' = 'xl') => {
  return `font-sans font-semibold text-${size}`;
};
