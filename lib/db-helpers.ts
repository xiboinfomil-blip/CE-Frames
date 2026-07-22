import { db } from './db';
import { eq, and, desc, asc, or, ilike, count, notInArray, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  users,
  media,
  galleries,
  galleryMedia,
  VISIBILITY_STATUSES,
  type VisibilityStatus
} from '@/db/schema';

// ==========================================
// 1. ADMIN HELPERS
// ==========================================
export const adminHelpers = {
  getStats: async () => {
    const [userCount, mediaCount, galleryCount] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(media),
      db.select({ count: count() }).from(galleries)
    ]);

    return {
      users: userCount[0].count,
      media: mediaCount[0].count,
      galleries: galleryCount[0].count
    };
  },

  getRecentMedia: async (limit = 10) => {
    return await db.query.media.findMany({
      limit,
      orderBy: [desc(media.uploadedAt)],
      columns: {
        id: true,
        type: true,
        thumbnailUrl: true,
        caption: true,
        uploadedAt: true
      }
    });
  },
};

// ==========================================
// 2. USERS HELPERS
// ==========================================
export const userHelpers = {
  findById: async (id: string) => {
    return await db.query.users.findFirst({ 
      where: eq(users.id, id),
      columns: { passwordHash: false }
    });
  },
  
  findByEmail: async (email: string) => {
    return await db.query.users.findFirst({ where: eq(users.email, email) });
  },
};

// ==========================================
// 3. MEDIA HELPERS
// ==========================================
export const mediaHelpers = {
  create: async (data: typeof media.$inferInsert) => {
    return await db.insert(media).values(data).returning();
  },
  
  findById: async (id: string) => {
    return await db.query.media.findFirst({ 
      where: eq(media.id, id),
      with: {
        galleryMedia: {
          with: { 
            gallery: { columns: { id: true, title: true, slug: true } }
          }
        }
      }
    });
  },
  
  search: async (query: string, limit = 20) => {
    return await db.query.media.findMany({
      where: or(
        ilike(media.caption, `%${query}%`),
        ilike(media.originalFilename, `%${query}%`)
      ),
      limit,
      orderBy: [desc(media.uploadedAt)],
      columns: {
        id: true,
        type: true,
        thumbnailUrl: true,
        caption: true,
        originalFilename: true,
        uploadedAt: true
      }
    });
  },

  findAll: async (options?: { 
    limit?: number; 
    offset?: number; 
    search?: string;
    type?: 'all' | 'image' | 'video' | 'gif';
    sortBy?: 'newest' | 'oldest' | 'name';
    excludeIds?: string[]; 
  }) => {
    const { limit = 50, offset = 0, search, type, sortBy = 'newest', excludeIds } = options || {};
    
    const conditions: any[] = [];
    
    if (type && type !== 'all') {
      conditions.push(eq(media.type, type));
    }
    
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      const searchConditions = [
        ilike(media.originalFilename, searchTerm),
        ilike(media.caption, searchTerm),
        media.locationName ? ilike(media.locationName, searchTerm) : null,
      ].filter(Boolean);
      
      if (searchConditions.length > 0) {
        conditions.push(or(...searchConditions));
      }
    }

    if (excludeIds && excludeIds.length > 0) {
      conditions.push(notInArray(media.id, excludeIds));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    switch (sortBy) {
      case 'oldest':
        orderByClause = [asc(media.uploadedAt)];
        break;
      case 'name':
        orderByClause = [asc(media.originalFilename)];
        break;
      case 'newest':
      default:
        orderByClause = [desc(media.uploadedAt)];
        break;
    }

    const items = await db.query.media.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: orderByClause
    });

    const countResult = await db.select({ count: count() })
      .from(media)
      .where(whereClause);
      
    const total = Number(countResult[0]?.count) || 0;

    return {
      items,
      total,
      hasMore: offset + limit < total
    };
  },
  
  update: async (id: string, data: Partial<typeof media.$inferInsert>) => {
    return await db.update(media).set(data).where(eq(media.id, id)).returning();
  },
  
  delete: async (id: string) => {
    return await db.delete(media).where(eq(media.id, id)).returning();
  }
};

// ==========================================
// 4. GALLERIES HELPERS
// ==========================================
export const galleryHelpers = {
  create: async (data: typeof galleries.$inferInsert) => {
    return await db.insert(galleries).values(data).returning();
  },
  
  findBySlug: async (slug: string) => {
    return await db.query.galleries.findFirst({
      where: eq(galleries.slug, slug),
      with: {
        user: { columns: { username: true } },
        coverMedia: { 
          columns: { id: true, thumbnailUrl: true, type: true } 
        },
        galleryMedia: {
          with: { 
            media: { 
              columns: { 
                id: true, 
                type: true, 
                thumbnailUrl: true, 
                fullResUrl: true,
                caption: true,
                width: true,
                height: true
              }
            } 
          },
          orderBy: [asc(galleryMedia.position)]
        }
      }
    });
  },

  findById: async (id: string) => {
    return await db.query.galleries.findFirst({
      where: eq(galleries.id, id),
      with: { 
        user: { columns: { username: true } },
        coverMedia: { columns: { id: true, thumbnailUrl: true } },
        galleryMedia: { 
          with: { 
            media: { 
              columns: { 
                id: true, 
                type: true, 
                thumbnailUrl: true, 
                fullResUrl: true,
                caption: true,
                width: true,
                height: true,
                durationSeconds: true
              }
            } 
          }, 
          orderBy: [asc(galleryMedia.position)] 
        } 
      }
    });
  },

  findByUserId: async (userId: string) => {
    return await db.query.galleries.findMany({
      where: eq(galleries.userId, userId),
      orderBy: [desc(galleries.createdAt)],
      columns: {
        id: true,
        title: true,
        slug: true,
        description: true,
        visibility: true,
        coverMediaId: true,
        layoutStyle: true, // Included for the new enum
        createdAt: true
      },
      with: {
        coverMedia: { columns: { id: true, thumbnailUrl: true } },
        galleryMedia: {
          with: { 
            media: { columns: { id: true, thumbnailUrl: true } } 
          },
          orderBy: [asc(galleryMedia.position)],
          limit: 1
        }
      }
    });
  },

  findAll: async (userId: string, options?: { 
    limit?: number; 
    offset?: number; 
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    visibility?: VisibilityStatus;
  }) => {
    const { limit = 50, offset = 0, search, sortBy = 'newest', visibility } = options || {};
    
    const conditions: any[] = [eq(galleries.userId, userId)];
    
    if (visibility) {
      conditions.push(eq(galleries.visibility, visibility));
    }
    
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(ilike(galleries.title, searchTerm));
    }

    const whereClause = and(...conditions);

    let orderByClause;
    switch (sortBy) {
      case 'oldest':
        orderByClause = [asc(galleries.createdAt)];
        break;
      case 'name':
        orderByClause = [asc(galleries.title)];
        break;
      case 'newest':
      default:
        orderByClause = [desc(galleries.createdAt)];
        break;
    }

    const items = await db.query.galleries.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: orderByClause,
      columns: {
        id: true,
        title: true,
        slug: true,
        description: true,
        visibility: true,
        coverMediaId: true,
        layoutStyle: true, // Included for the new enum
        createdAt: true
      },
      with: {
        coverMedia: { columns: { id: true, thumbnailUrl: true } }
      }
    });

    const countResult = await db.select({ count: count() })
      .from(galleries)
      .where(whereClause);
      
    const total = Number(countResult[0]?.count) || 0;

    if (items.length > 0) {
      const galleryIds = items.map(g => g.id);
      
      const allGalleryMedia = await db.query.galleryMedia.findMany({
        where: inArray(galleryMedia.galleryId, galleryIds),
        with: {
          media: {
            columns: {
              id: true,
              thumbnailUrl: true,
              type: true
            }
          }
        }
      });
      
      const mediaByGallery = new Map();
      const galleryMediaMap = new Map();
      
      allGalleryMedia.forEach(gm => {
        if (!galleryMediaMap.has(gm.galleryId)) {
          galleryMediaMap.set(gm.galleryId, []);
        }
        galleryMediaMap.get(gm.galleryId).push(gm.media);
      });
      
      galleryIds.forEach(galleryId => {
        const medias = galleryMediaMap.get(galleryId);
        if (medias && medias.length > 0) {
          const randomIndex = Math.floor(Math.random() * medias.length);
          mediaByGallery.set(galleryId, medias[randomIndex]);
        } else {
          mediaByGallery.set(galleryId, null);
        }
      });
      
      items.forEach(gallery => {
        (gallery as any).randomMedia = mediaByGallery.get(gallery.id) || null;
      });
    } else {
      items.forEach(gallery => {
        (gallery as any).randomMedia = null;
      });
    }

    return {
      items,
      total,
      hasMore: offset + limit < total
    };
  },

  findPublic: async (options?: { 
    limit?: number; 
    offset?: number;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'title';
    visibility?: VisibilityStatus | 'all';
  }) => {
    const { 
      limit = 12, 
      offset = 0,
      search, 
      sortBy = 'newest', 
      visibility = 'all'
    } = options || {};

    const conditions: any[] = [];

    // Clean if/else instead of array mutation (.pop)
    if (visibility && visibility !== 'all') {
      conditions.push(eq(galleries.visibility, visibility));
    } else {
      conditions.push(
        or(
          eq(galleries.visibility, 'public'),
          eq(galleries.visibility, 'password_protected')
        )
      );
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(galleries.title, searchTerm),
          galleries.description ? ilike(galleries.description, searchTerm) : undefined
        )
      );
    }

    const whereClause = and(...conditions);

    let orderByClause;
    switch (sortBy) {
      case 'oldest':
        orderByClause = [asc(galleries.createdAt)];
        break;
      case 'title':
        orderByClause = [asc(galleries.title)];
        break;
      case 'newest':
      default:
        orderByClause = [desc(galleries.createdAt)];
        break;
    }

    const items = await db.query.galleries.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: orderByClause,
      columns: {
        id: true,
        title: true,
        slug: true,
        description: true,
        visibility: true,
        layoutStyle: true, // Included for the new enum
        createdAt: true
      },
      with: {
        user: { columns: { username: true } },
        coverMedia: { columns: { id: true, thumbnailUrl: true, type: true } }
      }
    });

    const countResult = await db.select({ count: count() })
      .from(galleries)
      .where(whereClause);
  
    const total = Number(countResult[0]?.count) || 0;

    if (items.length > 0) {
      const galleryIds = items.map(g => g.id);
      
      const allGalleryMedia = await db.query.galleryMedia.findMany({
        where: inArray(galleryMedia.galleryId, galleryIds),
        with: {
          media: {
            columns: {
              id: true,
              thumbnailUrl: true,
              fullResUrl: true,
              type: true
            }
          }
        }
      });
      
      const mediaByGallery = new Map<string, any>();
      const galleryMediaMap = new Map<string, any[]>();
      
      allGalleryMedia.forEach(gm => {
        if (!galleryMediaMap.has(gm.galleryId)) {
          galleryMediaMap.set(gm.galleryId, []);
        }
        galleryMediaMap.get(gm.galleryId)!.push(gm.media);
      });
      
      galleryIds.forEach(galleryId => {
        const medias = galleryMediaMap.get(galleryId);
        if (medias && medias.length > 0) {
          const randomIndex = Math.floor(Math.random() * medias.length);
          mediaByGallery.set(galleryId, medias[randomIndex]);
        } else {
          mediaByGallery.set(galleryId, null);
        }
      });
      
      items.forEach(gallery => {
        (gallery as any).randomMedia = mediaByGallery.get(gallery.id) || null;
      });
    }

    return {
      items,
      total,
      hasMore: offset + limit < total
    };
  },

  update: async (id: string, data: Partial<typeof galleries.$inferInsert>) => {
    return await db.update(galleries).set(data).where(eq(galleries.id, id)).returning();
  },

  delete: async (id: string) => {
    return await db.delete(galleries).where(eq(galleries.id, id)).returning();
  },

  verifyGalleryPassword: async (galleryId: string, password: string) => {
    const gallery = await db.query.galleries.findFirst({
      where: eq(galleries.id, galleryId),
      columns: { passwordHash: true, visibility: true }
    });

    if (!gallery) {
      return { success: false, error: 'Gallery not found' };
    }

    if (gallery.visibility !== 'password_protected') {
      return { success: true };
    }

    if (!gallery.passwordHash) {
      return { success: false, error: 'Gallery has no password set' };
    }

    try {
      const isValid = await bcrypt.compare(password, gallery.passwordHash);
      return { success: isValid };
    } catch (error) {
      console.error('Password verification error:', error);
      return { success: false, error: 'Verification failed' };
    }
  }
};

// ==========================================
// 5. GALLERY MEDIA HELPERS
// ==========================================
export const galleryMediaHelpers = {
  addMediaToGallery: async (galleryId: string, mediaId: string, position: number) => {
    return await db.insert(galleryMedia).values({ galleryId, mediaId, position }).returning();
  },

  addMediaToGalleryEnd: async (galleryId: string, mediaId: string) => {
    const lastItem = await db.query.galleryMedia.findFirst({
      where: eq(galleryMedia.galleryId, galleryId),
      orderBy: [desc(galleryMedia.position)],
      columns: { position: true }
    });

    const nextPosition = lastItem ? lastItem.position + 1 : 0;

    return await db.insert(galleryMedia).values({ 
      galleryId, 
      mediaId, 
      position: nextPosition 
    }).returning();
  },

  getGalleryMediaWithDetails: async (galleryId: string) => {
    const items = await db.query.galleryMedia.findMany({
      where: eq(galleryMedia.galleryId, galleryId),
      orderBy: [asc(galleryMedia.position)],
      with: {
        media: {
          columns: {
            id: true,
            type: true,
            thumbnailUrl: true,
            fullResUrl: true,
            caption: true,
            width: true,
            height: true,
            durationSeconds: true,
            exifData: true,
            locationName: true
          }
        }
      }
    });

    return items;
  },

  reorderGallery: async (galleryId: string, orderedMediaIds: string[]) => {
    return await db.transaction(async (tx) => {
      for (let i = 0; i < orderedMediaIds.length; i++) {
        await tx.update(galleryMedia)
          .set({ position: i })
          .where(
            and(
              eq(galleryMedia.galleryId, galleryId),
              eq(galleryMedia.mediaId, orderedMediaIds[i])
            )
          );
      }
    });
  },
  
  removeMediaFromGallery: async (galleryId: string, mediaId: string) => {
    return await db.delete(galleryMedia)
      .where(and(eq(galleryMedia.galleryId, galleryId), eq(galleryMedia.mediaId, mediaId)))
      .returning();
  },

  findByGalleryId: async (galleryId: string, options?: {
    limit?: number;
    offset?: number;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'name' | 'position';
  }) => {
    const { limit = 50, offset = 0, search, sortBy = 'position' } = options || {};
    
    let mediaIdFilter: string[] | undefined = undefined;
    
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      const matchingMedia = await db.select({ id: media.id })
        .from(media)
        .where(or(
          ilike(media.originalFilename, searchTerm),
          ilike(media.caption, searchTerm),
          media.locationName ? ilike(media.locationName, searchTerm) : undefined
        ));
      mediaIdFilter = matchingMedia.map(m => m.id);
      
      if (mediaIdFilter.length === 0) {
        return { items: [], total: 0, hasMore: false };
      }
    }

    const conditions = [eq(galleryMedia.galleryId, galleryId)];
    if (mediaIdFilter) {
      conditions.push(inArray(galleryMedia.mediaId, mediaIdFilter));
    }

    const whereClause = and(...conditions);

    const countResult = await db.select({ count: count() })
      .from(galleryMedia)
      .where(whereClause);
    const total = Number(countResult[0]?.count) || 0;

    const items = await db.query.galleryMedia.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [asc(galleryMedia.position)],
      with: {
        media: {
          columns: {
            id: true,
            type: true,
            thumbnailUrl: true,
            fullResUrl: true,
            caption: true,
            width: true,
            height: true,
            durationSeconds: true,
            exifData: true,
            locationName: true,
            originalFilename: true,
            uploadedAt: true
          }
        }
      }
    });

    let sortedItems = items;
    if (sortBy === 'name') {
      sortedItems = [...items].sort((a, b) => 
        (a.media.originalFilename || '').localeCompare(b.media.originalFilename || '')
      );
    } else if (sortBy === 'newest') {
      sortedItems = [...items].sort((a, b) => 
        new Date(b.media.uploadedAt).getTime() - new Date(a.media.uploadedAt).getTime()
      );
    } else if (sortBy === 'oldest') {
      sortedItems = [...items].sort((a, b) => 
        new Date(a.media.uploadedAt).getTime() - new Date(b.media.uploadedAt).getTime()
      );
    }

    return {
      items: sortedItems,
      total,
      hasMore: limit ? offset + limit < total : false
    };
  }
};