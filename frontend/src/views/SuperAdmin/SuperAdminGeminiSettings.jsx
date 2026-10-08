import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    IconEye,
    IconEyeOff,
    IconTestPipe,
    IconTrash,
    IconSparkles,
} from '@tabler/icons-react';
import Page from '../../components/Page';
import { iconStroke } from '../../config/config';
import ApiClient from '../../helpers/ApiClient';

const SuperAdminGeminiSettings = () => {
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        setLoading(true);
        try {
            const response = await ApiClient.get('/superadmin/gemini-api-key');
            setIsApiKeyConfigured(response.data.configured);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error fetching Gemini API key.');
            console.error('Error fetching Gemini API key:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveApiKey = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await ApiClient.post('/superadmin/gemini-api-key', {
                gemini_api_key: geminiApiKey,
            });
            const data = response.data;
            if (response.status >= 200 && response.status < 300) {
                setGeminiApiKey('');
                setIsApiKeyConfigured(data.configured);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error saving Gemini API key.');
            console.error('Error saving Gemini API key:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearApiKey = async () => {
        if (window.confirm('Are you sure you want to clear the Gemini API Key?')) {
            setLoading(true);
            try {
                const response = await ApiClient.post('/superadmin/gemini-api-key', {
                    gemini_api_key: '',
                });
                const data = response.data;
                if (response.status >= 200 && response.status < 300) {
                    setGeminiApiKey('');
                    setIsApiKeyConfigured(false);
                    toast.success(data.message);
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Error clearing Gemini API key.');
                console.error('Error clearing Gemini API key:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleTestApiKey = async () => {
        setLoading(true);
        try {
            const response = await ApiClient.get('/superadmin/test-gemini-api-key');
            const data = response.data;
            if (response.status >= 200 && response.status < 300) {
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error testing Gemini API key.');
            console.error('Error testing Gemini API key:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Page>
            <div className="mx-auto max-w-4xl py-4 lg:py-8">
                <div className="mb-6 flex items-center gap-4">
                    <div className="rounded-2xl bg-restro-green/10 p-3 text-restro-green">
                        <IconSparkles size={24} stroke={iconStroke} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Gemini API Key Settings
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and verify the API key used for AI features.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSaveApiKey}
                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-restro-border-green dark:bg-restro-card-bg"
                >
                    <div className="mb-6">
                        <label
                            htmlFor="geminiApiKey"
                            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                        >
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                id="geminiApiKey"
                                className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition focus:border-restro-green dark:border-restro-border-green dark:text-white"
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                placeholder="Enter your Gemini API Key"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition hover:text-restro-green"
                            >
                                {showApiKey ? (
                                    <IconEyeOff size={20} stroke={iconStroke} />
                                ) : (
                                    <IconEye size={20} stroke={iconStroke} />
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {isApiKeyConfigured
                                ? 'A key is configured. Enter a new key to replace it.'
                                : 'No key is configured. The key is used by the restaurant AI features.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-restro-border-green sm:flex-row">
                        <button
                            type="submit"
                            className="rounded-xl bg-restro-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-restro-green-button-hover disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save API Key'}
                        </button>
                        <button
                            type="button"
                            onClick={handleTestApiKey}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-restro-border-green dark:text-gray-200 dark:hover:bg-restro-gray"
                            disabled={loading || (!geminiApiKey && !isApiKeyConfigured)}
                        >
                            <IconTestPipe size={18} stroke={iconStroke} />
                            Test API Key
                        </button>
                        <button
                            type="button"
                            onClick={handleClearApiKey}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                            disabled={loading || !geminiApiKey}
                        >
                            <IconTrash size={18} stroke={iconStroke} />
                            Clear API Key
                        </button>
                    </div>
                </form>
            </div>
        </Page>
    );
};

export default SuperAdminGeminiSettings;
