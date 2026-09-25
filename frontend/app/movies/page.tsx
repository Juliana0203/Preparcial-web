'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type RelatedPerson = { id: string; name: string };
type Prize = { id: string; name: string };
type Movie = {
  id: string;
  title: string;
  releaseDate: string;
  actors?: RelatedPerson[];
  prizes?: Prize[];
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadMovies = async () => {
      try {
        const response = await fetch('/api/v1/movies', { signal: controller.signal });
        if (!response.ok) throw new Error(`No se pudieron obtener las películas (${response.status})`);
        setMovies((await response.json()) as Movie[]);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(requestError instanceof Error ? requestError.message : 'Ocurrió un error al cargar las películas');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadMovies();
    return () => controller.abort();
  }, []);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catálogo audiovisual</p>
          <h1>Películas</h1>
          <p className="page-description">Consulta las películas registradas, sus actores principales y los premios asociados.</p>
        </div>
        <Link className="button button-primary" href="/movies/create"><span aria-hidden="true">+</span> Crear película</Link>
      </header>
      {isLoading && <p className="loading-message">Cargando películas...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!isLoading && !error && movies.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">🎞️</span>
          <h2>Aún no hay películas</h2>
          <p>Registra la primera película del sistema.</p>
          <Link className="button button-primary" href="/movies/create">Crear película</Link>
        </div>
      )}
      {!isLoading && !error && movies.length > 0 && (
        <div className="movie-table-wrapper">
          <table className="movie-table">
            <thead><tr><th>Título</th><th>Fecha de lanzamiento</th><th>Actor</th><th>Premio</th></tr></thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <th scope="row"><Link className="movie-title-link" href={`/movies/${movie.id}`}>{movie.title}</Link></th>
                  <td>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}</td>
                  <td>{movie.actors?.[0]?.name ?? 'Sin actor asociado'}</td>
                  <td>{movie.prizes?.[0]?.name ?? 'Sin premio asociado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link className="back-link" href="/actors">← Volver al inicio</Link>
    </main>
  );
}
