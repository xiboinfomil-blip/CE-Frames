// lib/utils.ts
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the correct MIME type for a video URL or filename
 * If mimeType is provided, use that (from database)
 * Otherwise, detect from file extension
 */
export function getVideoMimeType(
  urlOrFilename: string | undefined,
  mimeType?: string | null
): string {
  // If we have a stored MIME type, use it
  if (mimeType && mimeType.startsWith('video/')) {
    return mimeType;
  }

  if (!urlOrFilename) {
    return 'video/mp4'; // fallback
  }

  // Extract file extension (remove query params)
  const filename = urlOrFilename.split('?')[0].toLowerCase();
  
  // Map extensions to MIME types
  if (filename.endsWith('.webm')) return 'video/webm';
  if (filename.endsWith('.mov') || filename.endsWith('.quicktime')) return 'video/quicktime';
  if (filename.endsWith('.ogv') || filename.endsWith('.ogg')) return 'video/ogg';
  if (filename.endsWith('.mkv')) return 'video/x-matroska';
  
  // Default to mp4
  return 'video/mp4';
}