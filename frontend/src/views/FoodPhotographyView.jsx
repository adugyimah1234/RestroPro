import React, { useState } from 'react';
import MenuInputForm from '../components/MenuInputForm';
import ImageDisplayGrid from '../components/ImageDisplayGrid';

const FoodPhotographyView = () => {
    const [generatedImages, setGeneratedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateImages = async (menuText, style) => {
        setLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const response = await fetch('/api/v1/food-photography/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menuText, style }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate images.');
            }

            const data = await response.json();
            setGeneratedImages(data.images);
        } catch (err) {
            setError(err.message);
            console.error("Error generating images:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Virtual Food Photographer</h1>
            <MenuInputForm onGenerate={handleGenerateImages} loading={loading} />
            {loading && <p className="text-center my-4">Generating images, please wait...</p>}
            {error && <p className="text-red-500 text-center my-4">Error: {error}</p>}
            <ImageDisplayGrid images={generatedImages} />
        </div>
    );
};

export default FoodPhotographyView;
