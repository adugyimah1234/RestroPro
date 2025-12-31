import React, { useState } from 'react';

const MenuInputForm = ({ onGenerate, loading }) => {
    const [menuText, setMenuText] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('Bright / Modern');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (menuText.trim()) {
            onGenerate(menuText, selectedStyle);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="mb-4">
                <label htmlFor="menuText" className="block text-gray-700 text-sm font-bold mb-2">
                    Paste your menu text here:
                </label>
                <textarea
                    id="menuText"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
                    placeholder="e.g., 'Pizza Margherita: Tomato, mozzarella, basil. $12.00'"
                    value={menuText}
                    onChange={(e) => setMenuText(e.target.value)}
                    required
                ></textarea>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Choose a photography style:
                </label>
                <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio"
                            name="photoStyle"
                            value="Rustic / Dark"
                            checked={selectedStyle === 'Rustic / Dark'}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                        />
                        <span className="ml-2">Rustic / Dark</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio"
                            name="photoStyle"
                            value="Bright / Modern"
                            checked={selectedStyle === 'Bright / Modern'}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                        />
                        <span className="ml-2">Bright / Modern</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio"
                            name="photoStyle"
                            value="Social Media"
                            checked={selectedStyle === 'Social Media'}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                        />
                        <span className="ml-2">Social Media (Top-down)</span>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate Food Photos'}
            </button>
        </form>
    );
};

export default MenuInputForm;
