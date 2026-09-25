'use client';

import ActorForm from '../../users/ActorForm';
import { useActors } from '../ActorsContext';
import { useRouter } from 'next/navigation';

export default function CreateActorPage() {
  const { addActor } = useActors();
  const router = useRouter();

  return (
    <main className="page">
      <ActorForm
        onActorCreated={(actor) => {
          addActor(actor);
          router.push('/actors');
        }}
        onCancel={() => router.push('/actors')}
      />
    </main>
  );
}
