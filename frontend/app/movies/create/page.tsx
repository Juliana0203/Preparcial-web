'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type CreatedRecord = { id: string };

async function createRecord<T extends CreatedRecord>(
  endpoint: string,
  payload: Record<string, string | number>,
  label: string,
): Promise<T> {
  const response = await fetch(`/api/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`No se pudo crear ${label} (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export default function CreateMoviePage() {
  const [movie, setMovie] = useState({
    title: '',
    poster: '',
    duration: '',
    country: '',
    releaseDate: '',
    popularity: '',
  });
  const [actor, setActor] = useState({
    name: '',
    photo: '',
    nationality: '',
    birthDate: '',
    biography: '',
  });
  const [prize, setPrize] = useState({
    name: '',
    category: '',
    year: '',
    status: 'won',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateMovie = (field: keyof typeof movie, value: string) =>
    setMovie((current) => ({ ...current, [field]: value }));
  const updateActor = (field: keyof typeof actor, value: string) =>
    setActor((current) => ({ ...current, [field]: value }));
  const updatePrize = (field: keyof typeof prize, value: string) =>
    setPrize((current) => ({ ...current, [field]: value }));

  const isFilled = (value: string) => value.trim().length > 0;
  const movieComplete = Object.values(movie).every(isFilled);
  const actorComplete = Object.values(actor).every(isFilled);
  const prizeComplete = Object.values(prize).every(isFilled);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const incompleteSections = [
      !movieComplete && 'Información de la película',
      !actorComplete && 'Actor principal',
      !prizeComplete && 'Premio',
    ].filter(Boolean);
    if (incompleteSections.length > 0) {
      setError(`Completa todos los campos de: ${incompleteSections.join(', ')}.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const [createdMovie, createdActor, createdPrize] = await Promise.all([
        createRecord<CreatedRecord>(
          'movies',
          {
            title: movie.title.trim(),
            poster: movie.poster.trim(),
            duration: Number(movie.duration),
            country: movie.country.trim(),
            releaseDate: movie.releaseDate,
            popularity: Number(movie.popularity),
          },
          'la película',
        ),
        createRecord<CreatedRecord>(
          'actors',
          {
            name: actor.name.trim(),
            photo: actor.photo.trim(),
            nationality: actor.nationality.trim(),
            birthDate: actor.birthDate,
            biography: actor.biography.trim(),
          },
          'el actor',
        ),
        createRecord<CreatedRecord>(
          'prizes',
          {
            name: prize.name.trim(),
            category: prize.category.trim(),
            year: Number(prize.year),
            status: prize.status,
          },
          'el premio',
        ),
      ]);

      await Promise.all([
        createRecord<CreatedRecord>(
          `actors/${createdActor.id}/movies/${createdMovie.id}`,
          {},
          'la asociación del actor con la película',
        ),
        createRecord<CreatedRecord>(
          `movies/${createdMovie.id}/prizes/${createdPrize.id}`,
          {},
          'la asociación del premio con la película',
        ),
      ]);

      setMessage('Película, actor, premio y asociaciones creados correctamente.');
      setMovie({ title: '', poster: '', duration: '', country: '', releaseDate: '', popularity: '' });
      setActor({ name: '', photo: '', nationality: '', birthDate: '', biography: '' });
      setPrize({ name: '', category: '', year: '', status: 'won' });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Ocurrió un error durante la creación de la película',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="form-section movie-creation-section">
        <div className="form-heading">
          <div>
            <p className="eyebrow">Flujo completo</p>
            <h1>Crear película</h1>
            <p className="page-description">
              Registra la película, su actor principal y el premio. Las entidades se crean por separado y luego se relacionan automáticamente.
            </p>
          </div>
        </div>

        <form className="actor-form" onSubmit={handleSubmit}>
          <fieldset className="form-group">
            <legend>🎞️ Información de la película <span className={movieComplete ? 'section-status complete' : 'section-status'}>{movieComplete ? '✓ Completa' : 'Pendiente'}</span></legend>
            <div className="form-grid">
              <label>Título<input required placeholder="Ej. El padrino" value={movie.title} onChange={(event) => updateMovie('title', event.target.value)} /></label>
              <label>Poster (URL)<input required type="url" value={movie.poster} placeholder="https://..." onChange={(event) => updateMovie('poster', event.target.value)} /></label>
              <label>Duración (minutos)<input required type="number" min="1" value={movie.duration} onChange={(event) => updateMovie('duration', event.target.value)} /></label>
              <label>País<input required placeholder="Ej. Estados Unidos" value={movie.country} onChange={(event) => updateMovie('country', event.target.value)} /></label>
              <label>Fecha de estreno<input required type="date" value={movie.releaseDate} onChange={(event) => updateMovie('releaseDate', event.target.value)} /></label>
              <label>Popularidad<input required type="number" min="0" step="0.1" value={movie.popularity} onChange={(event) => updateMovie('popularity', event.target.value)} /></label>
            </div>
          </fieldset>

          <fieldset className="form-group">
            <legend>🎭 Actor principal <span className={actorComplete ? 'section-status complete' : 'section-status'}>{actorComplete ? '✓ Completa' : 'Pendiente'}</span></legend>
            <div className="form-grid">
              <label>Nombre<input required placeholder="Ej. Al Pacino" value={actor.name} onChange={(event) => updateActor('name', event.target.value)} /></label>
              <label>Foto (URL)<input required type="url" value={actor.photo} placeholder="https://..." onChange={(event) => updateActor('photo', event.target.value)} /></label>
              <label>Nacionalidad<input required placeholder="Ej. Italiano-estadounidense" value={actor.nationality} onChange={(event) => updateActor('nationality', event.target.value)} /></label>
              <label>Fecha de nacimiento<input required type="date" value={actor.birthDate} onChange={(event) => updateActor('birthDate', event.target.value)} /></label>
              <label className="full-width">Biografía<textarea required rows={3} value={actor.biography} onChange={(event) => updateActor('biography', event.target.value)} /></label>
            </div>
          </fieldset>

          <fieldset className="form-group">
            <legend>🏆 Premio de la película <span className={prizeComplete ? 'section-status complete' : 'section-status'}>{prizeComplete ? '✓ Completa' : 'Pendiente'}</span></legend>
            <div className="form-grid">
              <label>Nombre<input required placeholder="Ej. Oscar" value={prize.name} onChange={(event) => updatePrize('name', event.target.value)} /></label>
              <label>Categoría<input required placeholder="Ej. Mejor actor" value={prize.category} onChange={(event) => updatePrize('category', event.target.value)} /></label>
              <label>Año<input required type="number" min="1900" max="2200" value={prize.year} onChange={(event) => updatePrize('year', event.target.value)} /></label>
              <label>Estado
                <select value={prize.status} onChange={(event) => updatePrize('status', event.target.value)}>
                  <option value="won">Ganado</option>
                  <option value="nominated">Nominado</option>
                </select>
              </label>
            </div>
          </fieldset>

          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando y asociando...' : 'Crear película completa'}
            </button>
            <Link className="button button-secondary" href="/actors">Volver al inicio</Link>
          </div>
          {message && <p className="form-success" role="status">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
