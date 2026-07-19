import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import GalleriesContent from './GalleriesContent';
import { Suspense } from 'react';

export const metadata = {
  title: 'My Galleries',
  description: 'Manage and view your personal galleries',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    visibility?: 'public' | 'private' | 'password_protected';
  }>;
}

// Loading fallback
function GalleriesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Telemetry...</p>
      </div>
    </div>
  );
}

async function GalleriesPageContent({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const session = await getServerSession(authOptions);
  
  const currentPage = Number(params.page) || 1;
  const limit = 12;
  const offset = (currentPage - 1) * limit;

  if (!session?.user?.id) {
    return (
      <GalleriesContent 
        initialGalleries={[]} 
        pagination={{ total: 0, currentPage: 1, totalPages: 1, hasNext: false, hasPrevious: false }} 
        filters={{ search: '', sortBy: 'newest' }} 
      />
    );
  }

  const { items: galleries, total } = await galleryHelpers.findAll(session.user.id, {
    search: params.search,
    sortBy: params.sortBy || 'newest',
    visibility: params.visibility,
    limit,
    offset
  });

  const totalPages = Math.ceil(total / limit);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return (
    <GalleriesContent 
      initialGalleries={galleries} 
      pagination={{ 
        total, 
        currentPage, 
        totalPages, 
        hasNext, 
        hasPrevious,
        limit 
      }}
      filters={{
        search: params.search || '',
        sortBy: params.sortBy || 'newest',
        visibility: params.visibility
      }}
    />
  );
}

export default async function GalleriesPage(props: PageProps) {
  return (
    <Suspense fallback={<GalleriesLoading />}>
      <GalleriesPageContent {...props} />
    </Suspense>
  );
}