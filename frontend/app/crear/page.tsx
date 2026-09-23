'use client';

import ActorForm from '../users/ActorForm';
import { useActors } from '../actors/ActorsContext';

export default function CreateActorPage() {
  const { addActor } = useActors();

  return (
    <main className="page">
      <ActorForm onActorCreated={addActor} />
    </main>
  );
}
