import React, { useState, useEffect } from 'react';

function AvailableImagesList({ onImageSelect, onImageInsert, refreshTrigger }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchAvailableImages();
  }, []);

  // Watch for refresh trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchAvailableImages();
    }
  }, [refreshTrigger]);

  const fetchAvailableImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/available-images');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        setError('Failed to fetch available images');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Error fetching available images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    if (selectedImages.includes(image.url)) {
      setSelectedImages(selectedImages.filter(url => url !== image.url));
    } else {
      setSelectedImages([...selectedImages, image.url]);
    }
  };

  const handleInsertSelected = () => {
    if (selectedImages.length > 0) {
      const imageMarkdowns = selectedImages.map(url => `![Image](${url})`).join('\n');
      onImageInsert(imageMarkdowns);
      setSelectedImages([]);
    }
  };

  const handleInsertSingle = (imageUrl) => {
    const imageMarkdown = `![Image](${imageUrl})`;
    onImageInsert(imageMarkdown);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] p-4 rounded-md border border-gray-600">
        <div className="text-center text-gray-300">
          <div className="loading-spinner mb-2"></div>
          <p>Loading available images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] p-4 rounded-md border border-gray-600">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button
            onClick={fetchAvailableImages}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] p-4 rounded-md border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white text-lg font-bold">Available Images</h4>
        <div className="flex gap-2">
          <button
            onClick={togglePreview}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={fetchAvailableImages}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center text-gray-400 py-4">
          <p>No images available</p>
          <p className="text-sm mt-1">Upload images or add them to src/img/ directory</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">
                {selectedImages.length} image(s) selected
              </span>
              {selectedImages.length > 0 && (
                <button
                  onClick={handleInsertSelected}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                >
                  Insert Selected ({selectedImages.length})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                className={`group relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                  selectedImages.includes(image.url)
                    ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                    : 'border-gray-600 hover:border-gray-400 bg-[#1a1a1a]'
                }`}
                onClick={() => handleImageClick(image)}
              >
                {showPreview ? (
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-400 text-xs text-center px-1">
                          📷
                    </span>
                  </div>
                )}
                
                {/* Fallback for broken images */}
                <div className="w-full h-20 bg-gray-600 flex items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-gray-400 text-xs">❌</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-1">
                  <div className="text-white text-xs truncate" title={image.name}>
                    {image.name}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {image.type === 'static' ? 'Static' : 'Uploaded'}
                  </div>
                </div>

                {/* Quick insert button */}
                <div className="absolute top-1 right-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInsertSingle(image.url);
                    }}
                    className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Insert this image"
                  >
                    +
                  </button>
                </div>

                {/* Selection indicator */}
                {selectedImages.includes(image.url) && (
                  <div className="absolute top-1 left-1">
                    <div className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                      ✓
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-gray-400 text-sm">
            <p>Click images to select multiple, or use the + button for quick insert</p>
            <p>Images are served from: <code>/src/img/</code> and <code>/uploads/</code></p>
          </div>
        </>
      )}
    </div>
  );
}

export default AvailableImagesList;
