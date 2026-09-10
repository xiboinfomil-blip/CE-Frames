import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '@/lib/auth'; // Adjust path to your auth options

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'admin' && session.user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
      folder: 'media-library',
      // Optional: Add user-specific folder or tag for better organization
      // tags: `user-${session.user.id}`
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
    });
  } catch (error) {
    console.error('Failed to generate Cloudinary signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}