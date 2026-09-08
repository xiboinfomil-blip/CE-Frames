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
  Link2 
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
  onSubmit: (payload: Omit<GalleryFormData, 'id'>, id?: string) => void;
  initialData?: GalleryFormData | null;
  isSubmitting?: boolean;
}

const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 255);

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone with the link can view' },
  { value: 'private', label: 'Private', icon: EyeOff, desc: 'Only you can view' },
  { value: 'password_protected', label: 'Password Protected', icon: Lock, desc: 'Requires key password' },
] as const;

const LAYOUT_OPTIONS = [
  { value: 'masonry', label: 'Masonry', icon: Columns3 },
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'slideshow', label: 'Slideshow', icon: Film },
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
    if (isOpen) {
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
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!slugEdited && formData.title) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, slugEdited]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    handleChange(e);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 255) newErrors.title = 'Title must be 255 chars or less';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (formData.visibility === 'password_protected' && !formData.password) {
      newErrors.password = 'Password is required for protected galleries';
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
      password: formData.visibility === 'password_protected' ? formData.password : undefined,
    };

    onSubmit(payload, initialData?.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-hidden z-10 my-8"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-100">
                {initialData ? 'Edit Gallery Settings' : 'Create New Gallery'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Gallery Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Annual Team Celebration 2026"
                  maxLength={255}
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:ring-rose-500/20 focus:border-rose-500'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.title}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL Identifier (Slug) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="annual-team-celebration-2026"
                    maxLength={255}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                      errors.slug
                        ? 'border-rose-500/50 focus:ring-rose-500/20'
                        : 'border-slate-800 focus:ring-rose-500/20 focus:border-rose-500'
                    }`}
                  />
                </div>
                {errors.slug ? (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.slug}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Auto-generated slug used for clean share links.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional summary or notes for visitors..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                />
              </div>

              {/* Visibility Options */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Visibility
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
                          setFormData((prev) => ({ ...prev, visibility: opt.value }))
                        }
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                        <div>
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Password Input */}
              {formData.visibility === 'password_protected' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Access Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter protection password"
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? 'border-rose-500/50 focus:ring-rose-500/20'
                          : 'border-slate-800 focus:ring-rose-500/20 focus:border-rose-500'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-400 font-medium">{errors.password}</p>
                  )}
                </motion.div>
              )}

              {/* Layout Style Segmented Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Layout Style
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  {LAYOUT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.layoutStyle === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, layoutStyle: opt.value }))
                        }
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-slate-800 text-rose-300 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <CustomButton
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : initialData
                    ? 'Save Changes'
                    : 'Create Gallery'}
                </CustomButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}