import { FaPhotoVideo } from 'react-icons/fa';

export const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Accueil',
    href: '/',
    desktop: true,
    mobile: true,
    mobileGroup: 'main',
    auth: 'any',
    type: 'link',
  },
  {
    id: 'about',
    label: 'À propos',
    href: '/about',
    desktop: true,
    mobile: true,
    mobileGroup: 'main',
    auth: 'any',
    type: 'link',
  },
  {
    id: 'gallery',
    label: 'Galerie',
    href: '/gallery',
    desktop: true,
    mobile: true,
    mobileGroup: 'extra',
    auth: 'any',
    type: 'link',
  },
  {
    id: 'manage-gallery',
    label: 'Gérer les galeries',
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
    label: 'Bibliothèque média',
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
  login: { label: 'Connexion admin CE', href: '/login', mobileLabel: 'Connexion admin' },
  logout: { label: 'Déconnexion', mobileLabel: 'Déconnexion' }
};