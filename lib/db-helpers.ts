import { db } from './db';
import {
  eq,
  and,
  not,
  desc,
  asc,
  or,
  ilike,
  count,
  notInArray,
  inArray,
  SQL,
} from 'drizzle-orm';
import bcrypt from 'bcryptjs';

import {
  users,
  ceProfile,
  media,
  galleries,
  galleryMedia,
  type UserRole,
} from '@/db/schema';

import {
  PaginatedResponse,
  PasswordVerificationResult,
} from '@/types/types';

// ==========================================
// TYPES
// ==========================================

type MediaRow = typeof media.$inferSelect;
type GalleryRow = typeof galleries.$inferSelect;
type GalleryMediaRow = typeof galleryMedia.$inferSelect;

type EnrichedGallery = GalleryRow & {
  randomMedia: MediaRow | null;
};

type GalleryWithItems = GalleryRow & {
  items: {
    position: number;
    media: MediaRow | null;
  }[];
};

type GalleryMediaWithDetails = GalleryMediaRow & {
  media: MediaRow;
};

// Simple UUID validation regex
const isValidUUID = (id: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(id);
};

// ==========================================
// 1. USERS HELPERS
// ==========================================

export const userHelpers = {
  findByEmail: async (email: string) => {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  findById: async (id: string) => {
    if (!isValidUUID(id)) return undefined;

    return await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isCeMember: true,
        photoUrl: true,
        createdAt: true,
      },
    });
  },

  findAll: async (search?: string) => {
    const searchTerm = search?.trim();

    return await db.query.users.findMany({
      where: searchTerm
        ? or(
            ilike(users.username, `%${searchTerm}%`),
            ilike(users.firstName, `%${searchTerm}%`),
            ilike(users.lastName, `%${searchTerm}%`),
            ilike(users.email, `%${searchTerm}%`)
          )
        : undefined,
      columns: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isCeMember: true,
        photoUrl: true,
        createdAt: true,
      },
      orderBy: [asc(users.username)],
    });
  },

  findCeMembers: async () => {
    return await db.query.users.findMany({
      where: or(eq(users.role, 'president'), eq(users.role, 'membre')),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
      },
      orderBy: [asc(users.lastName), asc(users.firstName), asc(users.username)],
    });
  },

  getCeProfile: async () => {
    return await db.query.ceProfile.findFirst({
      columns: { groupPhotoUrl: true },
    });
  },

  updateCeProfile: async (groupPhotoUrl: string | null) => {
    return await db
      .insert(ceProfile)
      .values({ id: 1, groupPhotoUrl })
      .onConflictDoUpdate({ target: ceProfile.id, set: { groupPhotoUrl } })
      .returning({ groupPhotoUrl: ceProfile.groupPhotoUrl });
  },

  create: async (data: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    isCeMember: boolean;
    photoUrl: string | null;
  }) => {
    const passwordHash = await bcrypt.hash(data.password, 12);

    return await db
      .insert(users)
      .values({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role,
        isCeMember: data.isCeMember,
        photoUrl: data.photoUrl,
      })
      .returning({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        isCeMember: users.isCeMember,
        photoUrl: users.photoUrl,
        createdAt: users.createdAt,
      });
  },

  update: async (
    id: string,
    data: Partial<{
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: UserRole;
      isCeMember: boolean;
      photoUrl: string | null;
    }>
  ) => {
    if (!isValidUUID(id)) return [];

    const values: Partial<typeof users.$inferInsert> = {};

    if (data.username !== undefined) values.username = data.username;
    if (data.firstName !== undefined) values.firstName = data.firstName;
    if (data.lastName !== undefined) values.lastName = data.lastName;
    if (data.email !== undefined) values.email = data.email;
    if (data.role !== undefined) values.role = data.role;
    if (data.isCeMember !== undefined) values.isCeMember = data.isCeMember;
    if (data.photoUrl !== undefined) values.photoUrl = data.photoUrl;
    if (data.password) {
      values.passwordHash = await bcrypt.hash(data.password, 12);
    }

    if (Object.keys(values).length === 0) {
      return [];
    }

    return await db
      .update(users)
      .set(values)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        isCeMember: users.isCeMember,
        photoUrl: users.photoUrl,
        createdAt: users.createdAt,
      });
  },

  delete: async (id: string) => {
    if (!isValidUUID(id)) return [];

    return await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
  },
};

// ==========================================
// 2. MEDIA HELPERS
// ==========================================

export const mediaHelpers = {
  create: async (data: typeof media.$inferInsert) => {
    return await db.insert(media).values(data).returning();
  },

  findAll: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    filter?: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    excludeIds?: string[];
  }): Promise<PaginatedResponse<MediaRow>> => {
    const {
      limit = 50,
      offset = 0,
      search,
      filter,
      sortBy = 'newest',
      excludeIds,
    } = options || {};

    const conditions: SQL[] = [];

    // Media type filter
    if (filter && ['image', 'video', 'gif'].includes(filter)) {
      conditions.push(
        eq(media.type, filter as MediaRow['type'])
      );
    }

    // Search
    if (
      search &&
      typeof search === 'string' &&
      search.trim()
    ) {
      const searchTerm = `%${search.trim()}%`;

      const searchConditions: SQL[] = [
        ilike(media.originalFilename, searchTerm),
        ilike(media.caption, searchTerm),
      ];

      if (media.locationName) {
        searchConditions.push(
          ilike(media.locationName, searchTerm)
        );
      }

      conditions.push(
        or(...searchConditions) as SQL
      );
    }

    // Exclude media IDs
    if (excludeIds && excludeIds.length > 0) {
      conditions.push(
        notInArray(media.id, excludeIds)
      );
    }

    const whereClause =
      conditions.length > 0
        ? and(...conditions)
        : undefined;

    // Sorting
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
      orderBy: orderByClause,
    });

    const countResult = await db
      .select({ count: count() })
      .from(media)
      .where(whereClause);

    const total =
      Number(countResult[0]?.count) || 0;

    return {
      items,
      total,
      hasMore: offset + limit < total,
    };
  },

  update: async (
    id: string,
    data: Partial<typeof media.$inferInsert>
  ) => {
    if (!isValidUUID(id)) return [];

    return await db
      .update(media)
      .set(data)
      .where(eq(media.id, id))
      .returning();
  },

  delete: async (id: string) => {
    if (!isValidUUID(id)) return [];

    return await db
      .delete(media)
      .where(eq(media.id, id))
      .returning();
  },
};

// ==========================================
// 3. GALLERIES HELPERS
// ==========================================

export const galleryHelpers = {
  // ----------------------------------------
  // CREATE
  // ----------------------------------------

  create: async (
    data: typeof galleries.$inferInsert
  ) => {
    return await db
      .insert(galleries)
      .values(data)
      .returning();
  },

  // ----------------------------------------
  // LATEST PUBLIC GALLERIES
  //
  // Used by homepage.
  //
  // Priority:
  // 1. Manually selected coverMedia
  // 2. First media in gallery by position
  // 3. null if gallery has no media
  // ----------------------------------------

getLatestPublic: async (limit = 3) => {
  const galleryRows =
    await db.query.galleries.findMany({
      where: eq(galleries.visibility, 'public'),

      limit,

      orderBy: [
        desc(galleries.createdAt),
      ],

      with: {
        // Manually selected cover
        coverMedia: true,

        // Get gallery media
        galleryMedia: {
          with: {
            media: true,
          },
        },
      },
    });

  return galleryRows.map((gallery) => {
    // If a cover was manually selected, always use it.
    if (gallery.coverMedia) {
      return {
        ...gallery,
        displayMedia: gallery.coverMedia,
      };
    }

    // Otherwise choose a random media item.
    const mediaItems = gallery.galleryMedia;

    const randomMedia =
      mediaItems.length > 0
        ? mediaItems[
            Math.floor(
              Math.random() * mediaItems.length
            )
          ].media
        : null;

    return {
      ...gallery,
      displayMedia: randomMedia,
    };
  });
},

  // ----------------------------------------
  // FIND BY ID - NOT PRIVATE
  // ----------------------------------------

  findByNotPrivateId: async (
    id: string
  ): Promise<
    GalleryWithItems | undefined
  > => {
    if (!isValidUUID(id)) {
      return undefined;
    }

    const gallery =
      await db.query.galleries.findFirst({
        where: and(
          eq(galleries.id, id),
          not(
            eq(
              galleries.visibility,
              'private'
            )
          )
        ),

        with: {
          coverMedia: true,

          galleryMedia: {
            with: {
              media: true,
            },

            orderBy: [
              asc(galleryMedia.position),
            ],
          },
        },
      });

    if (!gallery) {
      return undefined;
    }

    return {
      ...gallery,

      items: gallery.galleryMedia.map(
        (gm) => ({
          position: gm.position,
          media: gm.media,
        })
      ),
    };
  },

  // ----------------------------------------
  // FIND BY ID
  // ----------------------------------------

  findById: async (
    id: string
  ): Promise<
    GalleryWithItems | undefined
  > => {
    if (!isValidUUID(id)) {
      return undefined;
    }

    const gallery =
      await db.query.galleries.findFirst({
        where: eq(galleries.id, id),

        with: {
          coverMedia: true,

          galleryMedia: {
            with: {
              media: true,
            },

            orderBy: [
              asc(galleryMedia.position),
            ],
          },
        },
      });

    if (!gallery) {
      return undefined;
    }

    return {
      ...gallery,

      items: gallery.galleryMedia.map(
        (gm) => ({
          position: gm.position,
          media: gm.media,
        })
      ),
    };
  },

  // ----------------------------------------
  // FIND ALL
  // ----------------------------------------

  findAll: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    filter?: string;
    sortBy?: 'newest' | 'oldest' | 'name';
  }): Promise<
    PaginatedResponse<EnrichedGallery>
  > => {
    const {
      limit = 50,
      offset = 0,
      search,
      filter,
      sortBy = 'newest',
    } = options || {};

    const conditions: SQL[] = [];

    // Visibility filter
    if (
      filter &&
      [
        'public',
        'unlisted',
        'password_protected',
        'private',
      ].includes(filter)
    ) {
      conditions.push(
        eq(
          galleries.visibility,
          filter as GalleryRow['visibility']
        )
      );
    }

    // Search
    if (
      search &&
      typeof search === 'string' &&
      search.trim()
    ) {
      const searchTerm =
        `%${search.trim()}%`;

      conditions.push(
        ilike(
          galleries.title,
          searchTerm
        )
      );
    }

    const whereClause =
      conditions.length > 0
        ? and(...conditions)
        : undefined;

    // Sorting
    let orderByClause;

    switch (sortBy) {
      case 'oldest':
        orderByClause = [
          asc(galleries.createdAt),
        ];
        break;

      case 'name':
        orderByClause = [
          asc(galleries.title),
        ];
        break;

      case 'newest':
      default:
        orderByClause = [
          desc(galleries.createdAt),
        ];
        break;
    }

    const items =
      await db.query.galleries.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: orderByClause,

        with: {
          coverMedia: true,
        },
      });

    const countResult = await db
      .select({ count: count() })
      .from(galleries)
      .where(whereClause);

    const total =
      Number(countResult[0]?.count) || 0;

    // No galleries
    if (items.length === 0) {
      return {
        items: [],
        total,
        hasMore: offset + limit < total,
      };
    }

    const galleryIds = items.map(
      (gallery) => gallery.id
    );

    // Get all gallery media
    const allGalleryMedia =
      await db.query.galleryMedia.findMany({
        where: inArray(
          galleryMedia.galleryId,
          galleryIds
        ),

        with: {
          media: true,
        },
      });

    const mediaByGallery =
      new Map<
        string,
        MediaRow | null
      >();

    const galleryMediaMap =
      new Map<
        string,
        MediaRow[]
      >();

    allGalleryMedia.forEach((gm) => {
      if (
        !galleryMediaMap.has(
          gm.galleryId
        )
      ) {
        galleryMediaMap.set(
          gm.galleryId,
          []
        );
      }

      galleryMediaMap
        .get(gm.galleryId)!
        .push(gm.media);
    });

    // Select random media
    galleryIds.forEach(
      (galleryId) => {
        const medias =
          galleryMediaMap.get(
            galleryId
          );

        if (
          medias &&
          medias.length > 0
        ) {
          const randomIndex =
            Math.floor(
              Math.random() *
                medias.length
            );

          mediaByGallery.set(
            galleryId,
            medias[randomIndex]
          );
        } else {
          mediaByGallery.set(
            galleryId,
            null
          );
        }
      }
    );

    const enrichedItems =
      items.map((gallery) => {
        const randomMedia =
          gallery.coverMedia ||
          mediaByGallery.get(
            gallery.id
          ) || null;

        return {
          ...gallery,
          randomMedia,
        };
      });

    return {
      items:
        enrichedItems as EnrichedGallery[],
      total,
      hasMore:
        offset + limit < total,
    };
  },

  // ----------------------------------------
  // FIND PUBLIC
  // ----------------------------------------

  findPublic: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    filter?: string;
    sortBy?: 'newest' | 'oldest' | 'title';
  }): Promise<
    PaginatedResponse<EnrichedGallery>
  > => {
    const {
      limit = 12,
      offset = 0,
      search,
      filter,
      sortBy = 'newest',
    } = options || {};

    const conditions: SQL[] = [];

    // Visibility
    if (
      filter &&
      [
        'public',
        'unlisted',
        'password_protected',
        'private',
      ].includes(filter)
    ) {
      conditions.push(
        eq(
          galleries.visibility,
          filter as GalleryRow['visibility']
        )
      );
    } else {
      conditions.push(
        or(
          eq(
            galleries.visibility,
            'public'
          ),
          eq(
            galleries.visibility,
            'password_protected'
          )
        ) as SQL
      );
    }

    // Search
    if (
      search &&
      typeof search === 'string' &&
      search.trim()
    ) {
      const searchTerm =
        `%${search.trim()}%`;

      const searchConditions: SQL[] = [
        ilike(
          galleries.title,
          searchTerm
        ),
      ];

      if (galleries.description) {
        searchConditions.push(
          ilike(
            galleries.description,
            searchTerm
          )
        );
      }

      conditions.push(
        or(
          ...searchConditions
        ) as SQL
      );
    }

    const whereClause =
      and(...conditions);

    // Sorting
    let orderByClause;

    switch (sortBy) {
      case 'oldest':
        orderByClause = [
          asc(galleries.createdAt),
        ];
        break;

      case 'title':
        orderByClause = [
          asc(galleries.title),
        ];
        break;

      case 'newest':
      default:
        orderByClause = [
          desc(galleries.createdAt),
        ];
        break;
    }

    const items =
      await db.query.galleries.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: orderByClause,

        with: {
          coverMedia: true,
        },
      });

    const countResult = await db
      .select({ count: count() })
      .from(galleries)
      .where(whereClause);

    const total =
      Number(countResult[0]?.count) || 0;

    if (items.length === 0) {
      return {
        items: [],
        total,
        hasMore: offset + limit < total,
      };
    }

    const galleryIds = items.map(
      (gallery) => gallery.id
    );

    const allGalleryMedia =
      await db.query.galleryMedia.findMany({
        where: inArray(
          galleryMedia.galleryId,
          galleryIds
        ),

        with: {
          media: true,
        },
      });

    const mediaByGallery =
      new Map<
        string,
        MediaRow | null
      >();

    const galleryMediaMap =
      new Map<
        string,
        MediaRow[]
      >();

    allGalleryMedia.forEach((gm) => {
      if (
        !galleryMediaMap.has(
          gm.galleryId
        )
      ) {
        galleryMediaMap.set(
          gm.galleryId,
          []
        );
      }

      galleryMediaMap
        .get(gm.galleryId)!
        .push(gm.media);
    });

    galleryIds.forEach(
      (galleryId) => {
        const medias =
          galleryMediaMap.get(
            galleryId
          );

        if (
          medias &&
          medias.length > 0
        ) {
          const randomIndex =
            Math.floor(
              Math.random() *
                medias.length
            );

          mediaByGallery.set(
            galleryId,
            medias[randomIndex]
          );
        } else {
          mediaByGallery.set(
            galleryId,
            null
          );
        }
      }
    );

    const enrichedItems =
      items.map((gallery) => {
        const randomMedia =
          gallery.coverMedia ||
          mediaByGallery.get(
            gallery.id
          ) || null;

        return {
          ...gallery,
          randomMedia,
        };
      });

    return {
      items:
        enrichedItems as EnrichedGallery[],
      total,
      hasMore:
        offset + limit < total,
    };
  },

  // ----------------------------------------
  // UPDATE
  // ----------------------------------------

  update: async (
    id: string,
    data: Partial<typeof galleries.$inferInsert>
  ) => {
    if (!isValidUUID(id)) return [];

    return await db
      .update(galleries)
      .set(data)
      .where(eq(galleries.id, id))
      .returning();
  },

  // ----------------------------------------
  // DELETE
  // ----------------------------------------

  delete: async (id: string) => {
    if (!isValidUUID(id)) return [];

    return await db
      .delete(galleries)
      .where(eq(galleries.id, id))
      .returning();
  },

  // ----------------------------------------
  // VERIFY GALLERY PASSWORD
  // ----------------------------------------

  verifyGalleryPassword: async (
    galleryId: string,
    password: string
  ): Promise<PasswordVerificationResult> => {
    if (!isValidUUID(galleryId)) {
      return {
        success: false,
        error: 'Invalid gallery ID format',
      };
    }

    const gallery =
      await db.query.galleries.findFirst({
        where: eq(
          galleries.id,
          galleryId
        ),

        columns: {
          passwordHash: true,
          visibility: true,
        },
      });

    if (!gallery) {
      return {
        success: false,
        error: 'Gallery not found',
      };
    }

    if (
      gallery.visibility !==
      'password_protected'
    ) {
      return {
        success: true,
      };
    }

    if (!gallery.passwordHash) {
      return {
        success: false,
        error:
          'Gallery has no password set',
      };
    }

    try {
      const isValid =
        await bcrypt.compare(
          password,
          gallery.passwordHash
        );

      return {
        success: isValid,
      };
    } catch (error) {
      console.error(
        'Password verification error:',
        error
      );

      return {
        success: false,
        error: 'Verification failed',
      };
    }
  },
};

// ==========================================
// LATEST PUBLIC GALLERY TYPE
// ==========================================
//
// IMPORTANT:
// This must be AFTER galleryHelpers is declared.
//

export type LatestPublicGallery =
  Awaited<
    ReturnType<
      typeof galleryHelpers.getLatestPublic
    >
  >[number];

// ==========================================
// 4. GALLERY MEDIA HELPERS
// ==========================================

export const galleryMediaHelpers = {
  // ----------------------------------------
  // ADD MEDIA
  // ----------------------------------------

  addMediaToGallery: async (
    galleryId: string,
    mediaId: string,
    position: number
  ) => {
    if (
      !isValidUUID(galleryId) ||
      !isValidUUID(mediaId)
    ) {
      return [];
    }

    return await db
      .insert(galleryMedia)
      .values({
        galleryId,
        mediaId,
        position,
      })
      .returning();
  },

  // ----------------------------------------
  // ADD MEDIA TO END
  // ----------------------------------------

  addMediaToGalleryEnd: async (
    galleryId: string,
    mediaId: string
  ) => {
    if (
      !isValidUUID(galleryId) ||
      !isValidUUID(mediaId)
    ) {
      return [];
    }

    const lastItem =
      await db.query.galleryMedia.findFirst({
        where: eq(
          galleryMedia.galleryId,
          galleryId
        ),

        orderBy: [
          desc(galleryMedia.position),
        ],

        columns: {
          position: true,
        },
      });

    const nextPosition =
      lastItem
        ? lastItem.position + 1
        : 0;

    return await db
      .insert(galleryMedia)
      .values({
        galleryId,
        mediaId,
        position: nextPosition,
      })
      .returning();
  },

  // ----------------------------------------
  // GET GALLERY MEDIA
  // ----------------------------------------

  getGalleryMediaWithDetails: async (
    galleryId: string
  ) => {
    if (!isValidUUID(galleryId)) {
      return [];
    }

    return await db.query.galleryMedia.findMany({
      where: eq(
        galleryMedia.galleryId,
        galleryId
      ),

      orderBy: [
        asc(galleryMedia.position),
      ],

      with: {
        media: true,
      },
    });
  },

  // ----------------------------------------
  // REORDER GALLERY
  // ----------------------------------------

  reorderGallery: async (
    galleryId: string,
    orderedMediaIds: string[]
  ) => {
    if (
      !isValidUUID(galleryId) ||
      orderedMediaIds.length === 0
    ) {
      return [];
    }

    const firstQuery =
      db
        .update(galleryMedia)
        .set({
          position: 0,
        })
        .where(
          and(
            eq(
              galleryMedia.galleryId,
              galleryId
            ),
            eq(
              galleryMedia.mediaId,
              orderedMediaIds[0]
            )
          )
        );

    const restQueries =
      orderedMediaIds
        .slice(1)
        .map(
          (
            mediaId,
            index
          ) =>
            db
              .update(galleryMedia)
              .set({
                position:
                  index + 1,
              })
              .where(
                and(
                  eq(
                    galleryMedia.galleryId,
                    galleryId
                  ),
                  eq(
                    galleryMedia.mediaId,
                    mediaId
                  )
                )
              )
        );

    return await db.batch([
      firstQuery,
      ...restQueries,
    ]);
  },

  // ----------------------------------------
  // REMOVE MEDIA
  // ----------------------------------------

  removeMediaFromGallery: async (
    galleryId: string,
    mediaId: string
  ) => {
    if (
      !isValidUUID(galleryId) ||
      !isValidUUID(mediaId)
    ) {
      return [];
    }

    return await db
      .delete(galleryMedia)
      .where(
        and(
          eq(
            galleryMedia.galleryId,
            galleryId
          ),
          eq(
            galleryMedia.mediaId,
            mediaId
          )
        )
      )
      .returning();
  },

  // ----------------------------------------
  // FIND BY GALLERY ID
  // ----------------------------------------

  findByGalleryId: async (
    galleryId: string,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      filter?: string;
      sortBy?:
        | 'newest'
        | 'oldest'
        | 'name'
        | 'position';
    }
  ): Promise<
    PaginatedResponse<GalleryMediaWithDetails>
  > => {
    if (!isValidUUID(galleryId)) {
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }

    const {
      limit = 50,
      offset = 0,
      search,
      filter,
      sortBy = 'position',
    } = options || {};

    let mediaIdFilter:
      | string[]
      | undefined = undefined;

    // --------------------------------------
    // SEARCH FILTER
    // --------------------------------------

    if (
      search &&
      typeof search === 'string' &&
      search.trim()
    ) {
      const searchTerm =
        `%${search.trim()}%`;

      const matchingMedia =
        await db
          .select({
            id: media.id,
          })
          .from(media)
          .where(
            or(
              ilike(
                media.originalFilename,
                searchTerm
              ),
              ilike(
                media.caption,
                searchTerm
              ),
              media.locationName
                ? ilike(
                    media.locationName,
                    searchTerm
                  )
                : undefined
            )
          );

      mediaIdFilter =
        matchingMedia.map(
          (m) => m.id
        );

      if (
        mediaIdFilter.length === 0
      ) {
        return {
          items: [],
          total: 0,
          hasMore: false,
        };
      }
    }

    // --------------------------------------
    // TYPE FILTER
    // --------------------------------------

    if (
      filter &&
      ['image', 'video', 'gif'].includes(
        filter
      )
    ) {
      const filteredMedia =
        await db
          .select({
            id: media.id,
          })
          .from(media)
          .where(
            eq(
              media.type,
              filter as MediaRow['type']
            )
          );

      const filteredIds =
        filteredMedia.map(
          (m) => m.id
        );

      if (
        filteredIds.length === 0
      ) {
        return {
          items: [],
          total: 0,
          hasMore: false,
        };
      }

      if (mediaIdFilter) {
        mediaIdFilter =
          mediaIdFilter.filter(
            (id) =>
              filteredIds.includes(id)
          );

        if (
          mediaIdFilter.length === 0
        ) {
          return {
            items: [],
            total: 0,
            hasMore: false,
          };
        }
      } else {
        mediaIdFilter =
          filteredIds;
      }
    }

    // --------------------------------------
    // WHERE
    // --------------------------------------

    const conditions = [
      eq(
        galleryMedia.galleryId,
        galleryId
      ),
    ];

    if (mediaIdFilter) {
      conditions.push(
        inArray(
          galleryMedia.mediaId,
          mediaIdFilter
        )
      );
    }

    const whereClause =
      and(...conditions);

    // --------------------------------------
    // COUNT
    // --------------------------------------

    const countResult =
      await db
        .select({
          count: count(),
        })
        .from(galleryMedia)
        .where(whereClause);

    const total =
      Number(
        countResult[0]?.count
      ) || 0;

    // --------------------------------------
    // ITEMS
    // --------------------------------------

    const items =
      await db.query.galleryMedia.findMany({
        where: whereClause,

        limit,
        offset,

        orderBy: [
          asc(galleryMedia.position),
        ],

        with: {
          media: true,
        },
      });

    // --------------------------------------
    // SORTING
    // --------------------------------------

    let sortedItems = items;

    if (sortBy === 'name') {
      sortedItems = [...items].sort(
        (
          a: GalleryMediaWithDetails,
          b: GalleryMediaWithDetails
        ) =>
          (
            a.media.originalFilename ||
            ''
          ).localeCompare(
            b.media.originalFilename ||
              ''
          )
      );
    } else if (
      sortBy === 'newest'
    ) {
      sortedItems = [...items].sort(
        (
          a: GalleryMediaWithDetails,
          b: GalleryMediaWithDetails
        ) =>
          new Date(
            b.media.uploadedAt
          ).getTime() -
          new Date(
            a.media.uploadedAt
          ).getTime()
      );
    } else if (
      sortBy === 'oldest'
    ) {
      sortedItems = [...items].sort(
        (
          a: GalleryMediaWithDetails,
          b: GalleryMediaWithDetails
        ) =>
          new Date(
            a.media.uploadedAt
          ).getTime() -
          new Date(
            b.media.uploadedAt
          ).getTime()
      );
    }

    return {
      items: sortedItems,
      total,
      hasMore:
        offset + limit < total,
    };
  },
};