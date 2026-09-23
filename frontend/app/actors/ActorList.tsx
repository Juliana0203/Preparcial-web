'use client';

import { useActors } from './ActorsContext';
import { useState } from 'react';
import { Actor } from './types';
import ActorForm from '../users/ActorForm';

export default function ActorList() {
  const { actors, isLoading, error, updateActor, deleteActor } = useActors();
  const [actorToEdit, setActorToEdit] = useState<Actor | undefined>();
  const [deletingActorId, setDeletingActorId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    <section>
      <h1>Actores</h1>
      {deleteError && (
        <p className="form-error" role="alert">
          {deleteError}
        </p>
      )}
      {actorToEdit && (
        <ActorForm
          actorToEdit={actorToEdit}
          onActorUpdated={(actor) => {
            updateActor(actor);
            setActorToEdit(undefined);
          }}
          onCancel={() => setActorToEdit(undefined)}
        />
      )}
      {actors.length === 0 ? (
        <p>No hay actores registrados.</p>
      ) : (
        <ul className="actor-list">
          {actors.map((actor) => (
            <li className="actor-card" key={actor.id}>
              {actor.photo && (
                <img src={actor.photo} alt={`Foto de ${actor.name}`} className="actor-photo" />
              )}
              <div>
                <h2>{actor.name}</h2>
                <p>{actor.nationality}</p>
                <p>{actor.biography}</p>
                <button type="button" onClick={() => setActorToEdit(actor)}>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(actor)}
                  disabled={deletingActorId === actor.id}
                >
                  {deletingActorId === actor.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
