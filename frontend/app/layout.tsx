import type { Metadata } from 'next';
import { ActorsProvider } from './actors/ActorsContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'BackArte7',
  description: 'Listado de actores',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ActorsProvider>{children}</ActorsProvider>
      </body>
    </html>
  );
}
