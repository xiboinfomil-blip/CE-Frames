import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Helper function to format bytes
function formatBytes(bytes: number | undefined | null, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper to calculate percentage safely (returns '0.00' instead of 'N/A' to prevent NaN in frontend)
function calculatePercentage(used: number | undefined | null, limit: number | undefined | null): string {
  if (!limit || limit === 0 || used === undefined || used === null) return '0.00';
  return ((used / limit) * 100).toFixed(2);
}

export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing Cloudinary credentials' }, 
      { status: 500 }
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const usage = await cloudinary.api.usage();
    
    // FIX: Make the check case-insensitive since the API returns "Free" with a capital 'F'
    const isFreePlan = usage.plan?.toLowerCase() === 'free';
    
    // Cloudinary Free Plan Limits (in bytes)
    // 25 GB Storage and 25 GB Bandwidth are the standard free tier limits
    const FREE_PLAN_STORAGE_LIMIT = 25 * 1024 * 1024 * 1024; // 26,843,545,600 bytes
    const FREE_PLAN_BANDWIDTH_LIMIT = 25 * 1024 * 1024 * 1024; // 26,843,545,600 bytes

    const storageUsed = usage.storage?.usage || 0;
    // Fallback to free plan limit if API returns 0, null, or undefined for free plan
    const storageLimit = (isFreePlan && !usage.storage?.limit) 
      ? FREE_PLAN_STORAGE_LIMIT 
      : (usage.storage?.limit || 0);

    const bandwidthUsed = usage.bandwidth?.usage || 0;
    const bandwidthLimit = (isFreePlan && !usage.bandwidth?.limit) 
      ? FREE_PLAN_BANDWIDTH_LIMIT 
      : (usage.bandwidth?.limit || 0);

    const objectsUsed = usage.resources || usage.objects?.usage || 0;
    const objectsLimit = usage.objects?.limit || 0;

    // Free plan credits limit (fallback to 2500 or 25 depending on your current Cloudinary free tier structure)
    const creditsLimit = usage.credits?.limit || (isFreePlan ? 2500 : 0);
    const creditsUsed = usage.credits?.usage || 0;

    return NextResponse.json({
      success: true,
      usage: {
        plan: usage.plan,
        lastUpdated: usage.last_updated,
        objects: {
          used: objectsUsed,
          limit: objectsLimit || 'Unlimited',
          percentageUsed: calculatePercentage(objectsUsed, objectsLimit)
        },
        bandwidth: {
          used: formatBytes(bandwidthUsed),
          rawUsed: bandwidthUsed,
          limit: bandwidthLimit ? formatBytes(bandwidthLimit) : 'Unlimited',
          rawLimit: bandwidthLimit,
          percentageUsed: calculatePercentage(bandwidthUsed, bandwidthLimit)
        },
        storage: {
          used: formatBytes(storageUsed),
          rawUsed: storageUsed,
          limit: storageLimit ? formatBytes(storageLimit) : 'Unlimited',
          rawLimit: storageLimit,
          percentageUsed: calculatePercentage(storageUsed, storageLimit)
        },
        credits: {
          used: creditsUsed,
          limit: creditsLimit,
          percentageUsed: calculatePercentage(creditsUsed, creditsLimit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching Cloudinary usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Cloudinary usage information' }, 
      { status: 500 }
    );
  }
}