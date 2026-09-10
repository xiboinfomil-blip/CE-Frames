import { 
  MediaType, 
  VisibilityStatus, 
  LayoutStyle 
} from '@/db/schema';

// ==========================================
// 1. CORE ENTITY TYPES
// ==========================================

export interface MediaSummary {
  id: string;
  type: MediaType;
  thumbnailUrl: string;
  fullResUrl?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  originalFilename?: string | null;
  uploadedAt: Date;
  // ✅ Fixed: Replaced 'any' with 'Record<string, unknown>' for type safety
  exifData?: Record<string, unknown>;
  locationName?: string | null;
}

export interface GallerySummary {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  eventDate?: string | null;
  visibility: VisibilityStatus;
  layoutStyle: LayoutStyle;
  coverMediaId?: string | null;
  coverMedia?: {
    id: string;
    thumbnailUrl: string;
    fullResUrl?: string | null;
    type: MediaType;
    originalFilename?: string | null;
    caption?: string | null;
  } | null;
  createdAt: Date;
  updatedAt?: Date; 
  
  // Optional: Add if you show owner info in lists
  owner?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };

  // Optional: Add if you show counts in lists
  mediaCount?: number;
  
  randomMedia?: MediaSummary | null; // Used for list previews
}

export interface GalleryDetail extends GallerySummary {
  coverMedia?: {
    id: string;
    thumbnailUrl: string;
    type: MediaType;
  } | null;
  items: Array<{
    position: number;
    media: MediaSummary;
  }>;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

// ==========================================
// 2. RESPONSE WRAPPERS
// ==========================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface AdminStats {
  users: number;
  media: number;
  galleries: number;
}

// ==========================================
// 3. HELPER RETURN TYPES
// ==========================================

export interface PasswordVerificationResult {
  success: boolean;
  error?: string;
}

// This is now redundant if GalleryDetail.items is used, but kept if needed elsewhere
export interface GalleryMediaWithPosition {
  position: number;
  media: MediaSummary;
}