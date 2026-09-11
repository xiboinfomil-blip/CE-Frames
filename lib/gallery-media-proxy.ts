import { createHmac, timingSafeEqual } from 'node:crypto';

const MEDIA_TOKEN_TTL_SECONDS = 5 * 60;

export function getGallerySecuritySecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  // Keep the gallery available if deployment configuration is incomplete.
  // Set NEXTAUTH_SECRET in production to replace this fallback with a private key.
  return 'ce-frames-gallery-fallback-secret-change-in-production';
}

function signatureFor(galleryId: string, mediaId: string, expiresAt: number) {
  return createHmac('sha256', getGallerySecuritySecret())
    .update(`${galleryId}:${mediaId}:${expiresAt}`)
    .digest('hex');
}

export function createGalleryMediaToken(galleryId: string, mediaId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + MEDIA_TOKEN_TTL_SECONDS;
  return `${expiresAt}.${signatureFor(galleryId, mediaId, expiresAt)}`;
}

export function verifyGalleryMediaToken(
  galleryId: string,
  mediaId: string,
  token: string | null
) {
  if (!token) return false;

  const [expiresAtValue, signature] = token.split('.');
  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  const expected = signatureFor(galleryId, mediaId, expiresAt);
  const actualBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function galleryMediaUrl(galleryId: string, mediaId: string, type: 'image' | 'video' | 'gif') {
  const token = createGalleryMediaToken(galleryId, mediaId);
  return `/api/gallery-media/${mediaId}/${galleryId}/${token}/${type}`;
}

export function protectGalleryMedia<T extends {
  id: string;
  type: 'image' | 'video' | 'gif';
  fullResUrl?: string | null;
  thumbnailUrl: string;
}>(media: T, galleryId: string): T {
  return {
    ...media,
    fullResUrl: galleryMediaUrl(galleryId, media.id, media.type),
    thumbnailUrl: galleryMediaUrl(galleryId, media.id, media.type),
  };
}
