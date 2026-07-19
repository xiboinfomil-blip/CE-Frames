export interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  visibility: 'public' | 'unlisted' | 'password_protected' | 'private';
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  coverMediaId: string | null;
  user?: {
    username: string;
    avatarUrl: string | null;
  };
  coverMedia?: {
    id: string;
    thumbnailUrl: string;
    type: 'image' | 'video' | 'gif';
    fullResUrl?: string;
  };
  randomMedia?: {
    id: string;
    thumbnailUrl: string;
    fullResUrl?: string;
    type: 'image' | 'video' | 'gif';
  } | null;
  _count?: {
    galleryMedia: number;
    comments: number;
  };
}

export interface GalleryWithDetails extends Gallery {
  galleryMedia?: Array<{
    media: {
      id: string;
      type: 'image' | 'video' | 'gif';
      thumbnailUrl: string;
      fullResUrl: string;
      caption: string | null;
      width: number | null;
      height: number | null;
    };
  }>;
}