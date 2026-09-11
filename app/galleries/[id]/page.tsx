import { redirect } from 'next/navigation';

interface GalleriesAliasPageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleriesAliasPage({ params }: GalleriesAliasPageProps) {
  const { id } = await params;
  redirect(`/gallery/${id}`);
}
