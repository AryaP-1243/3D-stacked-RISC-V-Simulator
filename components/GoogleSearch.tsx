
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MagnifyingGlassIcon, GlobeAltIcon, ExclamationTriangleIcon } from './icons';

// FIX: Updated GroundingChunk type to have optional uri and title to match the type from the @google/genai library.
type GroundingChunk = {
    web?: {
        uri?: string;
        title?: string;
    }
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const GoogleSearch: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError('');
        setResult('');
        setSources([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            setResult(response.text);
            
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks) {
                // Filter out any potential empty chunks
                setSources(groundingChunks.filter(chunk => chunk.web && chunk.web.uri));
            }

        } catch (e: any) {
            console.error(e);
            setError('An error occurred while fetching results. Please ensure your API key is configured correctly and try again. ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="google-search-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ask a question about recent semiconductor news or technology trends:
                </label>
                <textarea
                    id="google-search-prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-2 font-sans text-base bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200 transition-colors"
                    placeholder="e.g., What are the latest advancements in 3nm chiplet interconnects announced this year?"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                />
            </div>
            <div className="flex justify-end">
                <button
                    onClick={handleSearch}
                    disabled={loading || !prompt.trim()}
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed"
                    aria-label="Analyze with Google Search"
                >
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <MagnifyingGlassIcon className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Analyzing...' : 'Analyze with Google Search'}</span>
                </button>
            </div>

            <div className="mt-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-md">
                         <div className="flex items-start space-x-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                               <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">Error</h4>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="p-6 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">Analysis Result</h4>
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                            {result.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                        </div>
                    </div>
                )}

                {sources.length > 0 && (
                    <div className="p-6 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                            <GlobeAltIcon className="w-6 h-6" />
                            <span>Sources</span>
                        </h4>
                        <ul className="list-decimal list-inside space-y-3">
                            {/* FIX: Added a check for `source.web.uri` to ensure it exists before rendering the link, satisfying TypeScript's type checker. */}
                            {sources.map((source, index) => (
                                source.web && source.web.uri && (
                                    <li key={index} className="text-sm">
                                        <a
                                            href={source.web.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium break-words"
                                            title={source.web.uri}
                                        >
                                            {source.web.title || "Untitled Source"}
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}

                {!loading && !result && !error && (
                    <div className="text-center py-10">
                         <p className="text-slate-500 dark:text-slate-400">Ask a question to get a real-time, Google-powered analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleSearch;
