import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import {
  getGallerySecuritySecret,
  verifyGalleryMediaToken,
} from '@/lib/gallery-media-proxy';

const ACCESS_COOKIE_PREFIX = 'gallery-access-';
export const runtime = 'nodejs';

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
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigins = [
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter((value): value is string => Boolean(value)).map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  }).filter((value): value is string => Boolean(value));
  const allowedOrigins = new Set([requestOrigin, ...configuredOrigins]);
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const fetchSite = request.headers.get('sec-fetch-site');
  const fetchDestination = request.headers.get('sec-fetch-dest');

  if (origin && !allowedOrigins.has(origin)) return false;
  if (fetchSite !== 'same-origin' && fetchSite !== 'same-site') {
    return false;
  }
  if (fetchDestination && fetchDestination !== 'image' && fetchDestination !== 'video') {
    return false;
  }

  // A copied URL opened directly has no page referrer. Requiring one blocks
  // direct address-bar, curl, and external hotlink requests.
  if (!referer) return false;

  try {
    return allowedOrigins.has(new URL(referer).origin);
  } catch {
    return false;
  }
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
    const variant = request.nextUrl.searchParams.get('variant') === 'thumbnail'
      ? 'thumbnail'
      : 'full';

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

    const range = variant === 'full' ? request.headers.get('range') : null;
    const sourceUrl = variant === 'thumbnail'
      ? galleryMedia.media.thumbnailUrl
      : galleryMedia.media.fullResUrl;
    const upstream = await fetch(sourceUrl, {
      headers: range ? { range } : undefined,
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse('Media unavailable', { status: upstream.status });
    }

    const responseBody = upstream.body;
    const headers = new Headers();
    const contentType = upstream.headers.get('content-type');
    const contentLength = upstream.headers.get('content-length');
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
