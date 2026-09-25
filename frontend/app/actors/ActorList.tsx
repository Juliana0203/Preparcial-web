'use client';

import { useActors } from './ActorsContext';
import { useEffect, useState } from 'react';
import { Actor } from './types';
import ActorForm from '../users/ActorForm';
import Link from 'next/link';

export default function ActorList() {
  const { actors, isLoading, error, updateActor, deleteActor } = useActors();
  const [actorToEdit, setActorToEdit] = useState<Actor | undefined>();
  const [deletingActorId, setDeletingActorId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!actorToEdit) {
      return;
    }

    const editForm = document.getElementById('actor-edit-form');
    editForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    editForm?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  }, [actorToEdit]);

  if (isLoading) return <p>Cargando actores...</p>;
  if (error) return <p role="alert">{error}</p>;

  const handleDelete = async (actor: Actor) => {
    if (!window.confirm(`¿Deseas eliminar a ${actor.name}?`)) {
      return;
    }

    setDeletingActorId(actor.id);
    setDeleteError(null);

    try {
      await deleteActor(actor.id);
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error
          ? requestError.message
          : 'Ocurrió un error al eliminar el actor',
      );
    } finally {
      setDeletingActorId(null);
    }
  };

  return (
    <section className="actors-section">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catálogo de talento</p>
          <h1>Actores</h1>
          <p className="page-description">Explora y administra los actores registrados en la plataforma.</p>
        </div>
        <Link className="button button-primary" href="/actors/create">
          <span aria-hidden="true">+</span> Crear actor
        </Link>
      </header>
      {deleteError && (
        <p className="form-error" role="alert">
          {deleteError}
        </p>
      )}
      {actorToEdit && (
        <ActorForm
          formId="actor-edit-form"
          actorToEdit={actorToEdit}
          onActorUpdated={(actor) => {
            updateActor(actor);
            setActorToEdit(undefined);
          }}
          onCancel={() => setActorToEdit(undefined)}
        />
      )}
      {actors.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">🎬</span>
          <h2>Aún no hay actores</h2>
          <p>Empieza creando el primer actor del catálogo.</p>
          <Link className="button button-primary" href="/actors/create">Crear primer actor</Link>
        </div>
      ) : (
        <ul className="actor-grid">
          {actors.map((actor) => (
            <li className="actor-card" key={actor.id}>
              <div className="actor-photo-wrapper">
                {actor.photo ? (
                  <img src={actor.photo} alt={`Foto de ${actor.name}`} className="actor-photo" />
                ) : (
                  <span className="actor-photo-placeholder" aria-hidden="true">🎭</span>
                )}
              </div>
              <div className="actor-card-content">
                <h2>{actor.name}</h2>
                <p className="actor-nationality">{actor.nationality}</p>
                <div className="card-actions">
                  <button className="button button-secondary" type="button" onClick={() => setActorToEdit(actor)}>
                    Editar
                  </button>
                  <button className="button button-danger" type="button" onClick={() => void handleDelete(actor)} disabled={deletingActorId === actor.id}>
                    {deletingActorId === actor.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
