import React, { useState, useEffect } from 'react';
import './GalleryModal.css';

// Helper: generate URL-friendly slug from title
const slugify = (text) =>
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
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'password_protected', label: 'Password Protected' },
];

const LAYOUT_OPTIONS = [
  { value: 'masonry', label: 'Masonry' },
  { value: 'grid', label: 'Grid' },
  { value: 'slideshow', label: 'Slideshow' },
];

const GalleryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null, // Pass to edit existing gallery
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    visibility: 'public',
    layoutStyle: 'masonry',
    password: '',
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          slug: initialData.slug || '',
          description: initialData.description || '',
          visibility: initialData.visibility || 'public',
          layoutStyle: initialData.layoutStyle || 'masonry',
          password: '', // Never prefill password
        });
        setSlugEdited(true); // Don't auto-overwrite existing slug
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

  // Auto-generate slug from title (only if user hasn't manually edited it)
  useEffect(() => {
    if (!slugEdited) {
      setFormData((prev) => ({ ...prev, slug: slugify(formData.title) }));
    }
  }, [formData.title, slugEdited]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    handleChange(e);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 255) newErrors.title = 'Title must be 255 chars or less';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (formData.visibility === 'password_protected' && !formData.password) {
      newErrors.password = 'Password is required for password-protected galleries';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build payload matching your schema
    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || null,
      visibility: formData.visibility,
      layoutStyle: formData.layoutStyle,
      // Password should be hashed server-side before storing in passwordHash
      password: formData.visibility === 'password_protected' ? formData.password : null,
    };

    onSubmit(payload, initialData?.id); // Pass ID if editing
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-content">
        <header className="modal-header">
          <h2>{initialData ? 'Edit Gallery' : 'Create Gallery'}</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title (Name) */}
          <div className="form-field">
            <label htmlFor="title">Name <span className="required">*</span></label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="My Awesome Gallery"
              maxLength={255}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-msg">{errors.title}</span>}
          </div>

          {/* Slug */}
          <div className="form-field">
            <label htmlFor="slug">Slug <span className="required">*</span></label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="my-awesome-gallery"
              maxLength={255}
              className={errors.slug ? 'error' : ''}
            />
            <small className="field-hint">URL-friendly identifier. Auto-generated from name.</small>
            {errors.slug && <span className="error-msg">{errors.slug}</span>}
          </div>

          {/* Description */}
          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A short description of this gallery..."
              rows={3}
            />
          </div>

          {/* Visibility */}
          <div className="form-field">
            <label htmlFor="visibility">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Password Field */}
          {formData.visibility === 'password_protected' && (
            <div className="form-field">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter gallery password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>
          )}

          {/* Layout Style */}
          <div className="form-field">
            <label htmlFor="layoutStyle">Layout Style</label>
            <select
              id="layoutStyle"
              name="layoutStyle"
              value={formData.layoutStyle}
              onChange={handleChange}
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-submit">
              {initialData ? 'Save Changes' : 'Create Gallery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryModal;