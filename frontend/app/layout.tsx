import type { Metadata } from 'next';
import Link from 'next/link';
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
        <nav className="site-nav" aria-label="Navegación principal">
          <div className="nav-inner">
            <Link className="brand" href="/actors">
              <span className="brand-mark" aria-hidden="true">✦</span>
              <span>BackArte7</span>
            </Link>
            <div className="nav-links">
              <Link href="/actors">Actores</Link>
              <Link href="/actors/create">Crear actor</Link>
              <Link href="/movies">Películas</Link>
              <Link className="nav-cta" href="/movies/create">Crear película</Link>
            </div>
          </div>
        </nav>
        <ActorsProvider>{children}</ActorsProvider>
      </body>
    </html>
  );
}
