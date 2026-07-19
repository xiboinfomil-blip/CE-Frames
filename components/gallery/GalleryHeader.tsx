interface GalleryHeaderProps {
  title?: string;
  description?: string;
}

export default function GalleryHeader({ 
  title = "Gallery", 
  description = "Browse our collection of galleries" 
}: GalleryHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}