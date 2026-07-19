import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Safety Check: Ensure all vars are present
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Missing Cloudinary Env Vars:', {
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret
    });
    
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

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // These params must match what you send in FormData
  const paramsToSign = {
    timestamp,
    folder: 'media-library'
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    apiSecret
  );

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName, // This was returning undefined before
  });
}