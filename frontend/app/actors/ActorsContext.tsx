'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Actor } from './types';

type ActorsContextValue = {
  actors: Actor[];
  isLoading: boolean;
  error: string | null;
  addActor: (actor: Actor) => void;
  updateActor: (actor: Actor) => void;
  deleteActor: (actorId: string) => Promise<void>;
};

const ActorsContext = createContext<ActorsContextValue | undefined>(undefined);

export function ActorsProvider({ children }: { children: ReactNode }) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchActors = async () => {
      try {
        const response = await fetch('/api/v1/actors', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`No se pudieron obtener los actores (${response.status})`);
        }

        const data: Actor[] = await response.json();
        setActors(data);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Ocurrió un error al obtener los actores',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchActors();

    return () => controller.abort();
  }, []);

  const addActor = (actor: Actor) => {
    setActors((currentActors) => [...currentActors, actor]);
  };

  const updateActor = (actor: Actor) => {
    setActors((currentActors) =>
      currentActors.map((currentActor) =>
        currentActor.id === actor.id ? actor : currentActor,
      ),
    );
  };

  const deleteActor = async (actorId: string) => {
    const response = await fetch(`/api/v1/actors/${actorId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`No se pudo eliminar el actor (${response.status})`);
    }

    setActors((currentActors) =>
      currentActors.filter((currentActor) => currentActor.id !== actorId),
    );
  };

  return (
    <ActorsContext.Provider
      value={{ actors, isLoading, error, addActor, updateActor, deleteActor }}
    >
      {children}
    </ActorsContext.Provider>
  );
}

export function useActors() {
  const context = useContext(ActorsContext);

  if (!context) {
    throw new Error('useActors debe utilizarse dentro de un ActorsProvider');
  }

  return context;
}
