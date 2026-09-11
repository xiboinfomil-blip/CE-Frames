import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { getServerSession } from 'next-auth/next';
import { join } from 'node:path';

import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import {
  getGallerySecuritySecret,
  verifyGalleryMediaToken,
} from '@/lib/gallery-media-proxy';

const ACCESS_COOKIE_PREFIX = 'gallery-access-';
const watermarkPath = join(process.cwd(), 'public', 'Logo name.png');
export const runtime = 'nodejs';

async function watermarkImage(input: Buffer, contentType: string) {
  const { default: sharp } = await import('sharp');
  const image = sharp(input);
  const metadata = await image.metadata();
  const imageWidth = metadata.width || 1200;
  const watermarkWidth = Math.max(96, Math.min(320, Math.round(imageWidth * 0.18)));
  const watermark = await sharp(await readFile(watermarkPath))
    .resize({ width: watermarkWidth, withoutEnlargement: true })
    .png()
    .toBuffer();

  const composited = image.composite([
    { input: watermark, gravity: 'southeast', blend: 'over' },
  ]);

  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    return { body: await composited.jpeg({ quality: 88, mozjpeg: true }).toBuffer(), contentType: 'image/jpeg' };
  }

  if (contentType.includes('webp')) {
    return { body: await composited.webp({ quality: 88 }).toBuffer(), contentType: 'image/webp' };
  }

  return { body: await composited.png({ compressionLevel: 9 }).toBuffer(), contentType: 'image/png' };
}

function hasGalleryAccess(request: NextRequest, galleryId: string) {
  const value = request.cookies.get(`${ACCESS_COOKIE_PREFIX}${galleryId}`)?.value;
  if (!value) return false;

  const [expiresAtValue, signature] = value.split('.');
  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  let secret: string;
  try {
    secret = getGallerySecuritySecret();
  } catch {
    return false;
  }

  const expected = createHmac('sha256', secret)
    .update(`${galleryId}:${expiresAt}`)
    .digest('hex');
  const actualBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function isSameSiteRequest(request: NextRequest) {
  const siteOrigin = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin && origin !== siteOrigin) return false;
  if (referer && new URL(referer).origin !== siteOrigin) return false;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string; galleryId?: string; token?: string; type?: string }> }
) {
  try {
    const routeParams = await params;
    const mediaId = routeParams.mediaId;
    const galleryId = routeParams.galleryId || request.nextUrl.searchParams.get('galleryId');
    const token = routeParams.token || request.nextUrl.searchParams.get('token');

    if (!galleryId || !verifyGalleryMediaToken(galleryId, mediaId, token) || !isSameSiteRequest(request)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const gallery = await galleryHelpers.findById(galleryId);
    if (!gallery || gallery.visibility === 'private') {
      return new NextResponse('Not found', { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const hasManagementAccess = session?.user?.role === 'admin' || session?.user?.role === 'president';
    if (gallery.visibility === 'password_protected' && !hasGalleryAccess(request, galleryId) && !hasManagementAccess) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const galleryMedia = gallery.items.find((item) => item.media?.id === mediaId);
    if (!galleryMedia?.media) {
      return new NextResponse('Not found', { status: 404 });
    }

    const range = request.headers.get('range');
    const upstream = await fetch(galleryMedia.media.fullResUrl, {
      headers: range ? { range } : undefined,
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse('Media unavailable', { status: upstream.status });
    }

    const upstreamContentType = upstream.headers.get('content-type') || '';
    const shouldWatermark = upstreamContentType.startsWith('image/') && !range;
    let watermarked: { body: Buffer; contentType: string } | null = null;
    if (shouldWatermark) {
      try {
        watermarked = await watermarkImage(
          Buffer.from(await upstream.arrayBuffer()),
          upstreamContentType
        );
      } catch (error) {
        console.error('Gallery watermark processing failed:', error);
      }
    }
    const responseBody = watermarked?.body
      ? new Uint8Array(watermarked.body)
      : upstream.body;
    const headers = new Headers();
    const contentType = watermarked?.contentType || upstreamContentType;
    const contentLength = shouldWatermark
      ? String(watermarked?.body.byteLength || '')
      : upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    if (contentType) headers.set('content-type', contentType);
    if (contentLength) headers.set('content-length', contentLength);
    if (contentRange) headers.set('content-range', contentRange);
    headers.set('cache-control', 'private, max-age=60, stale-while-revalidate=300');
    headers.set('accept-ranges', 'bytes');
    headers.set('x-content-type-options', 'nosniff');
    headers.set('content-disposition', 'inline');

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error('Gallery media proxy error:', error);
    return new NextResponse('Media unavailable', { status: 500 });
  }
}
