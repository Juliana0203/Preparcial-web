'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type NamedRecord = { id: string; name: string };
type Movie = {
  id: string;
  title: string;
  poster: string;
  duration: number;
  country: string;
  releaseDate: string;
  popularity: number;
  director?: NamedRecord | null;
  genre?: NamedRecord | null;
  actors?: NamedRecord[];
  prizes?: NamedRecord[];
  platforms?: NamedRecord[];
  reviews?: Array<{ id: string; description?: string; rating?: number }>;
  youtubeTrailer?: { id: string; url?: string } | null;
};

function formatDate(date: string | undefined) {
  return date
    ? new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Sin fecha';
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadMovie = async () => {
      try {
        const response = await fetch(`/api/v1/movies/${params.id}`, { signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 404 ? 'La película no fue encontrada.' : `No se pudo cargar la película (${response.status})`);
        setMovie((await response.json()) as Movie);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(requestError instanceof Error ? requestError.message : 'Ocurrió un error al cargar la película');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadMovie();
    return () => controller.abort();
  }, [params.id]);

  if (isLoading) return <main className="page"><p className="loading-message">Cargando detalle...</p></main>;
  if (error || !movie) return <main className="page"><p className="form-error" role="alert">{error ?? 'No se encontró la película.'}</p><Link className="back-link" href="/movies">← Volver a películas</Link></main>;

  return (
    <main className="page">
      <Link className="back-link movie-back-link" href="/movies">← Volver a películas</Link>
      <section className="movie-detail">
        <div className="movie-detail-hero">
          {movie.poster ? <img src={movie.poster} alt={`Poster de ${movie.title}`} /> : <span aria-hidden="true">🎞️</span>}
        </div>
        <div className="movie-detail-content">
          <p className="eyebrow">Detalle de película</p>
          <h1>{movie.title}</h1>
          <p className="movie-detail-date">{formatDate(movie.releaseDate)}</p>
          <div className="detail-grid">
            <div><span>Duración</span><strong>{movie.duration} minutos</strong></div>
            <div><span>País</span><strong>{movie.country}</strong></div>
            <div><span>Popularidad</span><strong>{movie.popularity}</strong></div>
            <div><span>Director</span><strong>{movie.director?.name ?? 'Sin director asociado'}</strong></div>
            <div><span>Género</span><strong>{movie.genre?.name ?? 'Sin género asociado'}</strong></div>
            <div><span>Tráiler</span><strong>{movie.youtubeTrailer?.url ? <a href={movie.youtubeTrailer.url} target="_blank" rel="noreferrer">Ver tráiler</a> : 'Sin tráiler asociado'}</strong></div>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <h2>Autores / actores</h2>
        {movie.actors?.length ? <ul className="detail-tags">{movie.actors.map((actor) => <li key={actor.id}>{actor.name}</li>)}</ul> : <p className="muted-text">No hay autores asociados.</p>}
      </section>
      <section className="detail-columns">
        <div className="detail-section"><h2>Premios</h2>{movie.prizes?.length ? <ul className="detail-list">{movie.prizes.map((prize) => <li key={prize.id}>{prize.name}</li>)}</ul> : <p className="muted-text">No hay premios asociados.</p>}</div>
        <div className="detail-section"><h2>Plataformas</h2>{movie.platforms?.length ? <ul className="detail-list">{movie.platforms.map((platform) => <li key={platform.id}>{platform.name}</li>)}</ul> : <p className="muted-text">No hay plataformas asociadas.</p>}</div>
      </section>
    </main>
  );
}
