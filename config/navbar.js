import { FaPhotoVideo } from 'react-icons/fa';

export const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    desktop: true, 
    mobile: true, 
    mobileGroup: 'main', 
    auth: 'any', // ✅ Changed from 'all' to 'any' to match TypeScript interface
    type: 'link',
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    desktop: true, 
    mobile: true, 
    mobileGroup: 'main', 
    auth: 'any', // ✅ Changed from 'all' to 'any'
    type: 'link',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    href: '/gallery',
    desktop: true, 
    mobile: true, 
    mobileGroup: 'extra', 
    auth: 'any', // ✅ Changed from 'all' to 'any'
    type: 'link', 
  },
  {
    id: 'manage-gallery',
    label: 'Manage Gallery',
    href: '/manage-gallery', 
    desktop: true, 
    mobile: true, 
    mobileGroup: 'extra', 
    auth: 'authenticated', 
    type: 'link',
    activePaths: ['/manage-gallery'], 
  },
  {
    id: 'media-library',
    label: 'Media Library',
    href: '/media-library',
    desktop: true, 
    mobile: true, 
    mobileGroup: 'extra', 
    auth: 'authenticated', 
    type: 'link',
    icon: FaPhotoVideo,
  },
];

export const AUTH_ITEMS = {
  login: { label: 'Login', href: '/login', mobileLabel: 'Start Your Engine' },
  logout: { label: 'Log Out', mobileLabel: 'Pit Stop (Log Out)' }
};