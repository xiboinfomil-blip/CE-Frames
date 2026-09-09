'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Globe,
  EyeOff,
  LayoutGrid,
  Columns3,
  Film,
  KeyRound,
  Link2,
} from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';

export interface GalleryFormData {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  visibility: 'public' | 'private' | 'password_protected';
  layoutStyle: 'masonry' | 'grid' | 'slideshow';
  password?: string;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    payload: Omit<GalleryFormData, 'id'>,
    id?: string,
  ) => void;
  initialData?: GalleryFormData | null;
  isSubmitting?: boolean;
}

const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 255);

const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    icon: Globe,
    desc: 'Tout le monde avec le lien peut voir',
  },
  {
    value: 'private',
    label: 'Privé',
    icon: EyeOff,
    desc: 'Seulement vous pouvez voir',
  },
  {
    value: 'password_protected',
    label: 'Protégé par mot de passe',
    icon: Lock,
    desc: 'Nécessite un mot de passe',
  },
] as const;

const LAYOUT_OPTIONS = [
  { value: 'masonry', label: 'Mosaïque', icon: Columns3 },
  { value: 'grid', label: 'Grille', icon: LayoutGrid },
  { value: 'slideshow', label: 'Diaporama', icon: Film },
] as const;

export default function GalleryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}: GalleryModalProps) {
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    slug: '',
    description: '',
    visibility: 'public',
    layoutStyle: 'masonry',
    password: '',
  });

  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          slug: initialData.slug || '',
          description: initialData.description || '',
          visibility: initialData.visibility || 'public',
          layoutStyle: initialData.layoutStyle || 'masonry',
          password: '',
        });
        setSlugEdited(true);
      } else {
        setFormData({
          title: '',
          slug: '',
          description: '',
          visibility: 'public',
          layoutStyle: 'masonry',
          password: '',
        });
        setSlugEdited(false);
      }

      setErrors({});
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!slugEdited && formData.title) {
      const timer = setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          slug: slugify(prev.title),
        }));
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [formData.title, slugEdited]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    handleChange(e);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (formData.title.length > 255) {
      newErrors.title = 'Le titre doit contenir 255 caractères maximum';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis';
    }

    if (
      formData.visibility === 'password_protected' &&
      !formData.password
    ) {
      newErrors.password = 'Un mot de passe est requis pour les galeries protégées';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      description: formData.description?.trim() || '',
      visibility: formData.visibility,
      layoutStyle: formData.layoutStyle,
      password:
        formData.visibility === 'password_protected'
          ? formData.password
          : undefined,
    };

    onSubmit(payload, initialData?.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#00345F]/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-xl bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl shadow-[#00345F]/30 overflow-hidden z-10 my-8"
          >
            <header className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F5F7FA]/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF1E5] flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-[#FF8201]" />
                </div>

                <h2 className="text-lg font-bold text-[#172033]">
                  {initialData
                    ? 'Modifier les paramètres de la galerie'
                    : 'Créer une nouvelle galerie'}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#64748B] hover:text-[#00345F] hover:bg-[#EAF4FB] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201]"
                aria-label="Fermer la boîte de dialogue"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold text-[#00345F] uppercase tracking-wider mb-2"
                >
                  Nom de la galerie <span className="text-[#FF8201]">*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="ex. Célébration d’équipe 2026"
                  maxLength={255}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-[#E2E8F0] focus:ring-[#FF8201]/20 focus:border-[#FF8201]'
                  }`}
                />

                {errors.title && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-xs font-semibold text-[#00345F] uppercase tracking-wider mb-2"
                >
                  Identifiant URL (slug) <span className="text-[#FF8201]">*</span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Link2 className="w-4 h-4" />
                  </div>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="celebration-equipe-2026"
                    maxLength={255}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all ${
                      errors.slug
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-[#E2E8F0] focus:ring-[#FF8201]/20 focus:border-[#FF8201]'
                    }`}
                  />
                </div>

                {errors.slug ? (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.slug}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#64748B]">
                    Slug généré automatiquement pour des liens de partage propres.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-semibold text-[#00345F] uppercase tracking-wider mb-2"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Résumé ou notes optionnelles pour les visiteurs..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF8201]/20 focus:border-[#FF8201] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#00345F] uppercase tracking-wider mb-2">
                  Visibilité
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {VISIBILITY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.visibility === opt.value;

                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            visibility: opt.value,
                          }))
                        }
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-[#EAF4FB] border-[#004A87] text-[#00345F] shadow-sm'
                            : 'bg-[#F5F7FA] border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#EAF4FB]/60 hover:text-[#00345F]'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 mb-2 ${
                            isSelected ? 'text-[#004A87]' : 'text-[#94A3B8]'
                          }`}
                        />

                        <div>
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-1">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.visibility === 'password_protected' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-[#00345F] uppercase tracking-wider mb-2"
                  >
                    Mot de passe d’accès <span className="text-[#FF8201]">*</span>
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                      <KeyRound className="w-4 h-4" />
                    </div>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Saisissez le mot de passe de protection"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-[#E2E8F0] focus:ring-[#FF8201]/20 focus:border-[#FF8201]'
                      }`}
                    />
                  </div>

                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.password}
                    </p>
                  )}
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#00345F] uppercase tracking-wider mb-2">
                  Style d’affichage
                </label>

                <div className="grid grid-cols-3 gap-2 p-1 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl">
                  {LAYOUT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.layoutStyle === opt.value;

                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            layoutStyle: opt.value,
                          }))
                        }
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-white text-[#004A87] shadow-sm border border-[#E2E8F0]'
                            : 'text-[#64748B] hover:text-[#00345F] hover:bg-[#EAF4FB]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <CustomButton
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-[#64748B] hover:text-[#00345F] hover:bg-[#EAF4FB]"
                >
                  Annuler
                </CustomButton>

                <CustomButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="bg-[#004A87] hover:bg-[#00345F] text-white shadow-lg shadow-[#004A87]/20"
                >
                  {isSubmitting
                    ? 'Enregistrement...'
                    : initialData
                      ? 'Enregistrer les modifications'
                      : 'Créer la galerie'}
                </CustomButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
