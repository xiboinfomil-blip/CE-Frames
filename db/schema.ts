import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  real,
  boolean,
  jsonb,
  point,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. TYPES (Single Source of Truth)
// ==========================================

export const MEDIA_TYPES = ['image', 'video', 'gif'] as const;
export const VISIBILITY_STATUSES = [
  'public', 
  'unlisted', 
  'password_protected', 
  'private'
] as const;
export const LAYOUT_STYLES = ['column', 'row', 'masonry'] as const;
export const USER_ROLES = ['admin', 'editor', 'viewer'] as const;

// Derive TypeScript types from the constants
export type MediaType = typeof MEDIA_TYPES[number];
export type VisibilityStatus = typeof VISIBILITY_STATUSES[number];
export type LayoutStyle = typeof LAYOUT_STYLES[number];
export type UserRole = typeof USER_ROLES[number];

// Derive Drizzle enums from the same constants
export const mediaTypeEnum = pgEnum('media_type', [...MEDIA_TYPES]);
export const visibilityEnum = pgEnum('visibility_status', [...VISIBILITY_STATUSES]);
export const layoutStyleEnum = pgEnum('layout_style', [...LAYOUT_STYLES]);
export const userRoleEnum = pgEnum('user_role', [...USER_ROLES]);

// ==========================================
// 2. TABLES
// ==========================================

// USERS (The Creators)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('editor').notNull(),
  isCeMember: boolean('is_ce_member').default(false).notNull(),
  photoUrl: varchar('photo_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// MEDIA (Images & Videos)
export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: mediaTypeEnum('type').notNull(),
  
  // The two URLs
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }).notNull(),
  fullResUrl: varchar('full_res_url', { length: 500 }).notNull(),
  
  originalFilename: varchar('original_filename', { length: 255 }),
  mimeType: varchar('mime_type', { length: 100 }),
  width: integer('width'),
  height: integer('height'),
  durationSeconds: real('duration_seconds'), // For videos
  
  // Storytelling & Metadata
  exifData: jsonb('exif_data'), // Camera settings, ISO, etc.
  caption: text('caption'), 
  locationName: varchar('location_name', { length: 255 }),
  coordinates: point('coordinates'), // Postgres native point type for maps (x, y)
  
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
});

// GALLERIES (No user reference)
export const galleries = pgTable('galleries', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  eventDate: date('event_date', { mode: 'string' }),
  
  visibility: visibilityEnum('visibility').default('public').notNull(),
  passwordHash: varchar('password_hash', { length: 255 }), // For password_protected
  
  coverMediaId: uuid('cover_media_id').references(() => media.id, { onDelete: 'set null' }),
  
  layoutStyle: layoutStyleEnum('layout_style').default('masonry').notNull(), 
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// GALLERY_MEDIA (Junction table for ordering)
export const galleryMedia = pgTable('gallery_media', {
  galleryId: uuid('gallery_id').references(() => galleries.id, { onDelete: 'cascade' }).notNull(),
  mediaId: uuid('media_id').references(() => media.id, { onDelete: 'cascade' }).notNull(),
  position: integer('position').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.galleryId, table.mediaId] }),
}));


// ==========================================
// 3. RELATIONS (Drizzle's Magic)
// ==========================================

export const usersRelations = relations(users, () => ({
  // No galleries relation since galleries don't reference users
}));

export const mediaRelations = relations(media, ({ many }) => ({
  galleryMedia: many(galleryMedia),
  // For the cover image relationship
  galleriesAsCover: many(galleries), 
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  coverMedia: one(media, {
    fields: [galleries.coverMediaId],
    references: [media.id],
  }),
  galleryMedia: many(galleryMedia),
}));

export const galleryMediaRelations = relations(galleryMedia, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryMedia.galleryId],
    references: [galleries.id],
  }),
  media: one(media, {
    fields: [galleryMedia.mediaId],
    references: [media.id],
  }),
}));