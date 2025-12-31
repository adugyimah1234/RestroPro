import React from 'react';

const ImageDisplayGrid = ({ images }) => {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img src={image.imageUrl} alt={image.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{image.name}</h3>
                        <p className="text-gray-600 text-sm">{image.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImageDisplayGrid;
