// config/navbar.js
import { FaImages, FaPhotoVideo } from 'react-icons/fa';

export const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    desktop: true, 
    mobile: true, 
    mobileGroup: 'main', 
    auth: 'all', 
    type: 'link',
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    desktop: true, 
    mobile: true, 
    mobileGroup: 'main', 
    auth: 'all', 
    type: 'link',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    href: '/gallery',
    desktop: true, 
    mobile: true, 
    mobileGroup: 'extra', 
    auth: 'all', 
    type: 'link', // Changed from 'gallery' to 'link'
    // Removed all dynamic properties (dataSource, dataKey, queryParam)
    // Removed desktopDropdown and mobileCategoryList
  },
  {
    id: 'order-images',
    label: 'Order Images',
    desktop: false, 
    mobile: true, 
    mobileGroup: 'extra', 
    auth: 'authenticated', 
    type: 'category-list',
    dataSource: 'imageCategories',
    dataKey: 'imagesFor',
    queryParam: 'category',
    mobileCategoryList: {
      basePath: '/orderimage', 
      theme: 'orange',
      header: { show: false }
    }
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
    activePaths: ['/manage-gallery'], // Matches /manage-gallery and /manage-gallery/*
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