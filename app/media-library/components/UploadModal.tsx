'use client';

import { useState, useRef, useEffect, useCallback, memo, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import exifr from 'exifr';
import Swal from 'sweetalert2';
import { MEDIA_TYPES } from '@/db/schema';
import BaseModal from '@/components/BaseModal'; 

// Adjust these paths if you placed the components in your /login folder instead of /ui
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { CustomButton } from '@/components/ui/CustomButton';

interface MediaItem {
  file: File;
  caption: string;
  locationName: string;
  coordinates: { lat: string; lng: string };
  gpsDetected: boolean;
  previewUrl?: string;
}

interface StorageUsage {
  plan: string;
  lastUpdated: string;
  storage: {
    used: string;
    rawUsed: number;
    limit: string;
    rawLimit: number;
    percentageUsed: string;
  };
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Derive valid MIME types from MEDIA_TYPES
const getValidMimeTypes = () => {
  const mimeMap: Record<typeof MEDIA_TYPES[number], string[]> = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    gif: ['image/gif']
  };
  
  return MEDIA_TYPES.flatMap(type => mimeMap[type]);
};

const VALID_TYPES = getValidMimeTypes();
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// Memoized thumbnail component to prevent unnecessary re-renders
const ThumbnailItem = memo(({ 
  item, 
  idx, 
  currentIndex, 
  onClick, 
  isLoading 
}: { 
  item: MediaItem; 
  idx: number; 
  currentIndex: number; 
  onClick: () => void;
  isLoading: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`group relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
      idx === currentIndex 
        ? 'border-red-600 ring-1 ring-red-600/20' 
        : 'border-slate-200 hover:border-slate-400 opacity-60 hover:opacity-100'
    }`}
    aria-label={`Select media ${idx + 1}`}
    aria-pressed={idx === currentIndex}
  >
    {item.file.type.startsWith('image/') ? (
      <Image 
        src={item.previewUrl!} 
        alt={`Thumbnail ${idx + 1}`} 
        width={64} 
        height={64} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        unoptimized // Required for blob: URLs
      />
    ) : (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )}
    {/* Racing stripe indicator for active item */}
    {idx === currentIndex && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
    )}
    <div className="absolute top-1 right-1 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
      {idx + 1}
    </div>
  </button>
));
ThumbnailItem.displayName = 'ThumbnailItem';

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generate unique IDs for accessibility
  const captionId = useId();
  const locationId = useId();
  const latId = useId();
  const lngId = useId();
  
  // State Management
  const [isDragging, setIsDragging] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) fetchStorageUsage();
  }, [isOpen]);

  const fetchStorageUsage = useCallback(async () => {
    setIsCheckingStorage(true);
    try {
      const res = await fetch('/api/storage');
      if (res.ok) {
        const data = await res.json();
        setStorageUsage(data.usage);
      }
    } catch (err) {
      console.error('Failed to fetch storage usage:', err);
    } finally {
      setIsCheckingStorage(false);
    }
  }, []);

  // Cleanup resources when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMediaItems(prev => {
        prev.forEach(item => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        return [];
      });
      setCurrentIndex(0);
      setError(null);
      setUploadProgress(0);
      setCurrentUploadIndex(0);
      setRejectedFiles([]);
    }
  }, [isOpen]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaItems.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [mediaItems]);

  const formatBytes = useCallback((bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const newItems: MediaItem[] = [];
    const rejected: string[] = [];
    const fileArray = Array.isArray(files) ? files : Array.from(files);

    for (const file of fileArray) {
      if (!VALID_TYPES.includes(file.type)) {
        rejected.push(`${file.name} (Invalid type)`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        rejected.push(`${file.name} (>50MB)`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const newItem: MediaItem = {
        file,
        caption: file.name.split('.')[0],
        locationName: '',
        coordinates: { lat: '', lng: '' },
        gpsDetected: false,
        previewUrl,
      };

      if (file.type.startsWith('image/')) {
        try {
          const exif = await exifr.parse(file, { gps: true });
          if (exif && exif.latitude && exif.longitude) {
            newItem.coordinates = {
              lat: exif.latitude.toFixed(6),
              lng: exif.longitude.toFixed(6)
            };
            newItem.gpsDetected = true;
          }
        } catch (err) {
          console.warn('EXIF parse failed:', err);
        }
      }
      newItems.push(newItem);
    }

    if (rejected.length > 0) {
      setRejectedFiles(rejected);
      setTimeout(() => setRejectedFiles([]), 6000);
    }

    if (newItems.length > 0) {
      setMediaItems(prev => {
        const updated = [...prev, ...newItems];
        if (prev.length === 0) setCurrentIndex(0);
        return updated;
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMediaItems(prev => prev.map((item, idx) => 
          idx === currentIndex 
            ? {
                ...item,
                coordinates: {
                  lat: position.coords.latitude.toFixed(6),
                  lng: position.coords.longitude.toFixed(6)
                },
                gpsDetected: false
              }
            : item
        ));
        setError(null);
        setIsDetectingLocation(false);
      },
      () => {
        setError('Location access denied. Please enable permissions or enter manually.');
        setIsDetectingLocation(false);
      }
    );
  }, [currentIndex]);

  const updateCurrentItem = useCallback((updates: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map((item, idx) => 
      idx === currentIndex ? { ...item, ...updates } : item
    ));
  }, [currentIndex]);

  const removeItem = useCallback((index: number) => {
    setMediaItems(prev => {
      const item = prev[index];
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      const newItems = prev.filter((_, idx) => idx !== index);
      
      if (newItems.length === 0) setCurrentIndex(0);
      else if (currentIndex >= newItems.length) setCurrentIndex(newItems.length - 1);
      else if (currentIndex > index) setCurrentIndex(currentIndex - 1);
      
      return newItems;
    });
  }, [currentIndex]);

  const getCloudinarySignature = useCallback(async () => {
    const res = await fetch('/api/sign-upload', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to prepare upload');
    return res.json();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (mediaItems.length === 0) return;

    if (storageUsage) {
      const totalNewSize = mediaItems.reduce((acc, item) => acc + item.file.size, 0);
      const limit = storageUsage.storage.rawLimit;
      const used = storageUsage.storage.rawUsed;

      if (limit > 0 && (used + totalNewSize) > limit) {
        const available = limit - used;
        setError(`Storage capacity exceeded. Required: ${formatBytes(totalNewSize)}, Available: ${formatBytes(available)}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    setCurrentUploadIndex(0);

    try {
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        setCurrentUploadIndex(i);
        
        const { signature, timestamp, apiKey, cloudName } = await getCloudinarySignature();

        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('folder', 'media-library');

        const xhr = new XMLHttpRequest();
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        const cloudinaryPromise = new Promise<any>((resolve, reject) => {
          xhr.open('POST', uploadUrl);
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const completedFilesProgress = (i / mediaItems.length) * 100;
              const currentFileProgress = (event.loaded / event.total) * (100 / mediaItems.length);
              setUploadProgress(completedFilesProgress + currentFileProgress);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try { resolve(JSON.parse(xhr.responseText)); } 
              catch (e) { reject(new Error('Invalid JSON response')); }
            } else {
              let errorMsg = 'Upload failed';
              try {
                const errData = JSON.parse(xhr.responseText);
                errorMsg = errData.error?.message || errorMsg;
              } catch (e) {}
              reject(new Error(errorMsg));
            }
          };

          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(formData);
        });

        const cloudinaryResult = await cloudinaryPromise;

        const saveRes = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cloudinaryPublicId: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            thumbnailUrl: cloudinaryResult.secure_url.replace('/upload/', '/upload/w_400,q_auto/'),
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            format: cloudinaryResult.format,
            fileSize: cloudinaryResult.bytes,
            title: item.caption,
            locationName: item.locationName.trim() || null,
            coordinates: (item.coordinates.lat && item.coordinates.lng) 
              ? `${item.coordinates.lng},${item.coordinates.lat}` 
              : null,
            originalFilename: item.file.name,
            mimeType: item.file.type,
          }),
        });

        if (!saveRes.ok) {
          const errData = await saveRes.json();
          throw new Error(errData.error || 'Failed to save metadata');
        }
      }

      setUploadProgress(100);
      
      await Swal.fire({
        icon: 'success',
        title: 'Upload Complete',
        text: `${mediaItems.length} asset(s) successfully added.`,
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        color: '#0f172a'
      });

      router.refresh();
      onClose();

    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'Upload failed');
      await Swal.fire({
        icon: 'error',
        title: 'Adding media Failed',
        text: err.message || 'An unexpected error occurred.',
        confirmButtonColor: '#dc2626',
        background: '#ffffff',
        color: '#0f172a'
      });
    } finally {
      setIsLoading(false);
    }
  }, [mediaItems, storageUsage, getCloudinarySignature, router, onClose, formatBytes]);

  const currentItem = mediaItems[currentIndex];
  const storagePercent = storageUsage ? parseFloat(storageUsage.storage.percentageUsed) : 0;
  const isStorageFull = storageUsage && storageUsage.storage.rawLimit > 0 && storagePercent >= 95;

  // Footer Actions Component using CustomButton
  const footerActions = (
    <>
      <div className="flex-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest self-center hidden sm:block">
        {mediaItems.length > 0 ? `${mediaItems.length} Item${mediaItems.length !== 1 ? 's' : ''} Queued` : 'No Assets Selected'}
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <CustomButton 
          variant="ghost"
          size="lg"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 sm:flex-none"
        >
          Abort
        </CustomButton>
        <CustomButton 
          variant="continue"
          size="lg"
          onClick={handleSubmit}
          disabled={mediaItems.length === 0 || isLoading || isCheckingStorage}
          isLoading={isLoading}
          leftIcon={!isCheckingStorage && !isLoading ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          ) : undefined}
          className="flex-1 sm:flex-none"
          shortcut="↵"
        >
          {isCheckingStorage ? 'Checking Capacity...' : `Add ${mediaItems.length > 1 ? `${mediaItems.length} Assets` : 'Asset'}`}
        </CustomButton>
      </div>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          New<span className="text-red-600">Asset</span>
          {mediaItems.length > 0 && (
            <span className="text-slate-400 text-base ml-3 font-mono not-italic font-medium">
              [{currentIndex + 1} / {mediaItems.length}]
            </span>
          )}
        </>
      }
      subtitle="Media Library Protocol"
      maxWidth="5xl"
      isLoading={isLoading}
      footer={footerActions}
    >
      <div className="space-y-6">
        
        {/* Storage Telemetry */}
        <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 relative overflow-hidden transition-colors duration-300">
          <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-sm ${isStorageFull ? 'bg-red-600 animate-pulse' : 'bg-emerald-500'}`} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-zinc-400">
                Cloud Storage Telemetry
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
              {storageUsage ? `${storageUsage.storage.percentageUsed}%` : 'CALCULATING...'}
            </span>
          </div>
          
          <div 
            className="relative h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden transition-colors duration-300"
            role="progressbar"
            aria-valuenow={storagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Storage capacity used"
          >
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                isStorageFull ? 'bg-red-600' : 'bg-gradient-to-r from-red-700 to-red-500'
              }`}
              style={{ width: `${Math.min(100, storagePercent)}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2.5 text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            <span>{storageUsage ? storageUsage.storage.used : '---'}</span>
            <span>{storageUsage ? storageUsage.storage.limit : '---'}</span>
          </div>
        </div>

        {/* Alerts */}
        {rejectedFiles.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 text-amber-900 dark:text-amber-200 rounded-r-lg text-sm font-medium flex items-start gap-3 animate-in slide-in-from-top-2" role="alert" aria-live="polite">
            <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-black uppercase tracking-wide text-amber-800 dark:text-amber-300 text-xs">Files Excluded</p>
              <p className="mt-1 text-amber-700/80 dark:text-amber-200/70 leading-relaxed">{rejectedFiles.join(', ')}</p>
            </div>
            <button 
              onClick={() => setRejectedFiles([])} 
              className="p-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Dismiss exclusion notice"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 text-red-800 dark:text-red-200 rounded-r-lg text-sm font-medium flex items-start gap-3 animate-in slide-in-from-top-2" role="alert" aria-live="assertive">
            <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Area */}
        {mediaItems.length === 0 ? (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`group relative border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500/20 ${
              isDragging 
                ? 'border-red-600 bg-red-50/50 dark:bg-red-950/10 scale-[1.01]' 
                : 'border-slate-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-800 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30'
            }`}
            role="button"
            tabIndex={0}
            aria-label="Click or drag files to upload"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept={MEDIA_TYPES.map(type => {
                if (type === 'image') return 'image/*';
                if (type === 'video') return 'video/*';
                return 'image/gif';
              }).join(',')}
              multiple
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              aria-hidden="true"
            />
            
            <div className={`mx-auto w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragging 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 rotate-12 scale-110' 
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/20 group-hover:text-red-600 group-hover:rotate-6'
            }`}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <p className="text-xl font-black text-slate-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors uppercase italic tracking-tight">
              {isDragging ? 'Drop to Add' : 'Click or Drag Files'}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-3 font-mono uppercase tracking-[0.15em]">
              {MEDIA_TYPES.map(type => type.toUpperCase()).join(', ')} • MAX 50MB • MULTI-SELECT
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Preview & Navigation */}
            <div className="relative">
              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0 || isLoading}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-full shadow-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Previous media"
                  >
                    <svg className="w-5 h-5 text-slate-700 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(mediaItems.length - 1, prev + 1))}
                    disabled={currentIndex === mediaItems.length - 1 || isLoading}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-full shadow-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Next media"
                  >
                    <svg className="w-5 h-5 text-slate-700 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Media Preview */}
                  <div className="shrink-0 mx-auto sm:mx-0 w-full sm:w-auto">
                    {currentItem.file.type.startsWith('image/') ? (
                      <Image 
                        src={currentItem.previewUrl!} 
                        alt="Preview"
                        width={256}
                        height={256}
                        className="w-full sm:w-64 h-64 object-cover rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-950 transition-colors duration-300"
                        unoptimized
                      />
                    ) : (
                      <video 
                        src={currentItem.previewUrl}
                        className="w-full sm:w-64 h-64 object-cover rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm bg-black transition-colors duration-300"
                        controls
                        aria-label="Video preview"
                      />
                    )}
                  </div>

                  {/* Metadata & Thumbnails */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate transition-colors duration-300" title={currentItem.file.name}>{currentItem.file.name}</p>
                        <div className="flex items-center gap-2 mt-2 font-mono text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                          <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded transition-colors duration-300">{formatBytes(currentItem.file.size)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-600" />
                          <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded transition-colors duration-300">{currentItem.file.type.split('/')[1].toUpperCase()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(currentIndex)}
                        disabled={isLoading}
                        className="p-2 text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Remove this file"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {currentItem.gpsDetected && (
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-3 py-2 rounded-lg w-fit transition-colors duration-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        EXIF GPS Locked
                      </div>
                    )}

                    {mediaItems.length > 1 && (
                      <div className="pt-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-zinc-500 mb-2">Film Strip</p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                          {mediaItems.map((item, idx) => (
                            <ThumbnailItem
                              key={idx}
                              item={item}
                              idx={idx}
                              currentIndex={currentIndex}
                              onClick={() => setCurrentIndex(idx)}
                              isLoading={isLoading}
                            />
          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields using CustomTextfield */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <CustomTextfield 
                  id={captionId}
                  type="text" 
                  value={currentItem.caption}
                  onChange={(e) => updateCurrentItem({ caption: e.target.value })}
                  disabled={isLoading}
                  placeholder="Describe this asset..."
                  label="Asset Caption"
                />
              </div>

              <div>
                <CustomTextfield
                  id={locationId}
                  type="text" 
                  value={currentItem.locationName}
                  onChange={(e) => updateCurrentItem({ locationName: e.target.value })}
                  disabled={isLoading}
                  placeholder="e.g., Silverstone Circuit, UK"
                  label="Location Name"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-zinc-400">
                    GPS Coordinates
                  </span>
                  {!currentItem.gpsDetected && (
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={detectLocation}
                      disabled={isLoading || isDetectingLocation}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {isDetectingLocation ? (
                        <>
                          <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg> 
                          Triangulating...
                        </>
                      ) : 'Detect Location'}
                    </CustomButton>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CustomTextfield
                    id={latId}
                    type="number"
                    step="any"
                    value={currentItem.coordinates.lat}
                    onChange={(e) => updateCurrentItem({ coordinates: { ...currentItem.coordinates, lat: e.target.value } })}
                    disabled={isLoading || currentItem.gpsDetected}
                    placeholder="00.000000"
                    label="Latitude"
                  />
                  <CustomTextfield
                    id={lngId}
                    type="number"
                    step="any"
                    value={currentItem.coordinates.lng}
                    onChange={(e) => updateCurrentItem({ coordinates: { ...currentItem.coordinates, lng: e.target.value } })}
                    disabled={isLoading || currentItem.gpsDetected}
                    placeholder="00.000000"
                    label="Longitude"
                  />
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isLoading && (
              <div className="space-y-3 pt-2" role="progressbar" aria-valuenow={Math.round(uploadProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                <div className="flex justify-between text-[10px] font-mono font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                  <span>Adding Asset {currentUploadIndex + 1} of {mediaItems.length}</span>
                  <span className="text-red-600 dark:text-red-400">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden transition-colors duration-300">
                  <div 
                    className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-200 ease-out rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
}