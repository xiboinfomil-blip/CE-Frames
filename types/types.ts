import { 
  MediaType, 
  VisibilityStatus, 
  LayoutStyle 
} from '@/db/schema'; // Adjust path if schema is in a different folder

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
  exifData?: any;
  locationName?: string | null;
}

export interface GallerySummary {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  visibility: VisibilityStatus;
  layoutStyle: LayoutStyle;
  coverMediaId?: string | null;
  createdAt: Date;
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
// 3. HELPER RETURN TYPES (Specific to logic)
// ==========================================

export interface PasswordVerificationResult {
  success: boolean;
  error?: string;
}

export interface GalleryMediaWithPosition {
  position: number;
  media: MediaSummary;
}