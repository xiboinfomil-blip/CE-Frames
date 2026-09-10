import Image from 'next/image';
import { userHelpers } from '@/lib/db-helpers';

export const metadata = {
  title: 'À propos | CE Frames',
  description: 'Découvrez les membres du Comité d’Entreprise.',
};

export default async function AboutPage() {
  const members = await userHelpers.findCeMembers();
  const ceProfile = await userHelpers.getCeProfile();

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-6 pb-20 pt-32 text-[#172033] dark:bg-[#0B1624] dark:text-white">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF8201]">CE Frames</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Les membres du CE</h1>
          <p className="mt-5 text-lg leading-relaxed text-[#64748B] dark:text-white/60">
            Retrouvez les personnes qui font vivre le Comité d’Entreprise et portent les sujets qui comptent pour les collaborateurs.
          </p>
        </header>

        {ceProfile?.groupPhotoUrl && (
          <Image src={ceProfile.groupPhotoUrl} alt="Membres du Comité d’Entreprise" width={1200} height={500} className="mt-12 max-h-[28rem] w-full object-cover" priority />
        )}

        {members.length > 0 ? (
          <section className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Membres du Comité d’Entreprise">
            {members.map((member) => {
              const name = [member.firstName, member.lastName].filter(Boolean).join(' ') || 'Membre du CE';
              return (
                <article key={member.id} className="border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#102238]">
                  {member.photoUrl ? (
                    <Image src={member.photoUrl} alt={name} width={480} height={480} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-[#EAF4FB] text-5xl font-black text-[#004A87] dark:bg-[#00345F] dark:text-white">
                      {(member.firstName?.[0] || member.lastName?.[0] || 'C').toUpperCase()}
                    </div>
                  )}
                  <h2 className="mt-5 text-xl font-bold">{name}</h2>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-white/50">Membre du Comité d’Entreprise</p>
                </article>
              );
            })}
          </section>
        ) : (
          <p className="mt-14 border border-dashed border-[#CBD5E1] bg-white p-8 text-[#64748B] dark:border-white/20 dark:bg-[#102238] dark:text-white/60">
            Les membres du Comité d’Entreprise seront bientôt présentés ici.
          </p>
        )}
      </div>
    </main>
  );
}