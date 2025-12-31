import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IconEye, IconEyeOff, IconTestPipe, IconTrash } from '@tabler/icons-react'; // Import new icons
import { useTheme } from '../../contexts/ThemeContext'; // Assuming ThemeContext is available
import { iconStroke } from '../../config/config'; // Assuming iconStroke is available

const SuperAdminGeminiSettings = () => {
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false); // State for showing/hiding API key
    const { theme } = useTheme(); // Get current theme

    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/superadmin/gemini-api-key');
            const data = await response.json();
            if (response.ok) {
                setGeminiApiKey(data.gemini_api_key || '');
            } else {
                toast.error(data.message || 'Failed to fetch Gemini API key.');
            }
        } catch (error) {
            toast.error('Error fetching Gemini API key.');
            console.error('Error fetching Gemini API key:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveApiKey = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/v1/superadmin/gemini-api-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gemini_api_key: geminiApiKey }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Failed to save Gemini API key.');
            }
        } catch (error) {
            toast.error('Error saving Gemini API key.');
            console.error('Error saving Gemini API key:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearApiKey = async () => {
        if (window.confirm('Are you sure you want to clear the Gemini API Key?')) {
            setLoading(true);
            try {
                const response = await fetch('/api/v1/superadmin/gemini-api-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ gemini_api_key: '' }), // Send empty string to clear
                });
                const data = await response.json();
                if (response.ok) {
                    setGeminiApiKey('');
                    toast.success(data.message);
                } else {
                    toast.error(data.message || 'Failed to clear Gemini API key.');
                }
            } catch (error) {
                toast.error('Error clearing Gemini API key.');
                console.error('Error clearing Gemini API key:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleTestApiKey = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/superadmin/test-gemini-api-key');
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Failed to test Gemini API key.');
            }
        } catch (error) {
            toast.error('Error testing Gemini API key.');
            console.error('Error testing Gemini API key:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-restro-background text-restro-text min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Gemini API Key Settings</h1>
            <form onSubmit={handleSaveApiKey} className="bg-restro-card-bg p-6 rounded-lg ">
                <div className="mb-4">
                    <label htmlFor="geminiApiKey" className="block text-restro-text text-sm font-bold mb-2">
                        Gemini API Key:
                    </label>
                    <div className="relative">
                        <input
                            type={showApiKey ? 'text' : 'password'}
                            id="geminiApiKey"
                            className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 bg-restro-input-bg text-restro-text leading-tight focus:outline-none focus:shadow-outline"
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            placeholder="Enter your Gemini API Key"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-restro-text"
                        >
                            {showApiKey ? <IconEyeOff stroke={iconStroke} /> : <IconEye stroke={iconStroke} />}
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save API Key'}
                    </button>
                    <button
                        type="button"
                        onClick={handleTestApiKey}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading || !geminiApiKey}
                    >
                        <IconTestPipe stroke={iconStroke} className="inline-block mr-1" /> Test API Key
                    </button>
                    <button
                        type="button"
                        onClick={handleClearApiKey}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading || !geminiApiKey}
                    >
                        <IconTrash stroke={iconStroke} className="inline-block mr-1" /> Clear API Key
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SuperAdminGeminiSettings;
