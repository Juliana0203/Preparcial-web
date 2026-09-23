'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Actor } from '../actors/types';

type ActorFormProps = {
  onActorCreated?: (actor: Actor) => void;
  onActorUpdated?: (actor: Actor) => void;
  actorToEdit?: Actor;
  onCancel?: () => void;
};

export default function ActorForm({
  onActorCreated,
  onActorUpdated,
  actorToEdit,
  onCancel,
}: ActorFormProps) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [nationality, setNationality] = useState('');
  const [birthday, setBirthday] = useState('');
  const [biography, setBiography] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actorToEdit) {
      return;
    }

    setName(actorToEdit.name);
    setPhoto(actorToEdit.photo);
    setNationality(actorToEdit.nationality);
    setBirthday(actorToEdit.birthDate?.slice(0, 10) ?? '');
    setBiography(actorToEdit.biography);
    setMessage(null);
    setError(null);
  }, [actorToEdit]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        actorToEdit ? `/api/v1/actors/${actorToEdit.id}` : '/api/v1/actors',
        {
        method: actorToEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          photo,
          nationality,
          birthDate: birthday,
          biography,
        }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `${actorToEdit ? 'No se pudo actualizar' : 'No se pudo crear'} el actor (${response.status})`,
        );
      }

      const savedActor: Actor = await response.json();
      if (actorToEdit) {
        onActorUpdated?.(savedActor);
      } else {
        onActorCreated?.(savedActor);
      }
      setName('');
      setPhoto('');
      setNationality('');
      setBirthday('');
      setBiography('');
      setMessage(actorToEdit ? 'Actor actualizado correctamente.' : 'Actor creado correctamente.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Ocurrió un error al crear el actor',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-section">
      <h1>{actorToEdit ? 'Editar actor' : 'Crear actor'}</h1>
      <form className="actor-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label>
          Photo
          <input
            type="url"
            name="photo"
            value={photo}
            onChange={(event) => setPhoto(event.target.value)}
            placeholder="https://ejemplo.com/foto.jpg"
            required
          />
        </label>

        <label>
          Nacionalidad
          <input
            name="nationality"
            value={nationality}
            onChange={(event) => setNationality(event.target.value)}
            required
          />
        </label>

        <label>
          Cumpleaños
          <input
            type="date"
            name="birthday"
            value={birthday}
            onChange={(event) => setBirthday(event.target.value)}
            required
          />
        </label>

        <label>
          Biografía
          <textarea
            name="biography"
            value={biography}
            onChange={(event) => setBiography(event.target.value)}
            rows={4}
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : actorToEdit ? 'Guardar cambios' : 'Guardar actor'}
        </button>
        {actorToEdit && onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}

        {message && <p className="form-success">{message}</p>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
