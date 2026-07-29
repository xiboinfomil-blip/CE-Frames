// ✅ Updated Import: Using GallerySummary from consolidated types
import { GallerySummary } from '@/types/types';

// Helper to get unlocked galleries from localStorage
export const getUnlockedGalleries = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('unlockedGalleries');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save unlocked gallery to localStorage
export const saveUnlockedGallery = (galleryId: string): void => {
  if (typeof window === 'undefined') return;
  const unlocked = getUnlockedGalleries();
  if (!unlocked.includes(galleryId)) {
    unlocked.push(galleryId);
    localStorage.setItem('unlockedGalleries', JSON.stringify(unlocked));
  }
};

// Filter and sort galleries
// ✅ Updated parameter type to GallerySummary[]
export const filterAndSortGalleries = (
  galleries: GallerySummary[],
  searchQuery: string,
  sortBy: 'newest' | 'oldest' | 'name',
  filterType: 'all' | 'public' | 'password_protected'
) => {
  return galleries
    .filter((gallery) => {
      // Apply filter type
      if (filterType === 'public' && gallery.visibility !== 'public') return false;
      if (filterType === 'password_protected' && gallery.visibility !== 'password_protected') return false;
      
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = gallery.title?.toLowerCase().includes(query);
        const matchesDescription = gallery.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });
};