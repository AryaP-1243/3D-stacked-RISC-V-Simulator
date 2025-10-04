import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, PaperAirplaneIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, HandThumbUpIcon, HandThumbDownIcon } from '../components/icons';
import { SystemConfig, GpuConfig } from '../types';
import GoogleSearch from '../components/GoogleSearch';

type Message = {
    sender: 'user' | 'model';
    text: string;
    id: number;
    feedback?: 'up' | 'down';
};

interface AIAssistantProps {
    config2D: SystemConfig;
    config3D: SystemConfig;
    gpuConfig: GpuConfig;
}

type ActiveTab = 'chat' | 'search';

const LoadingSpinner: React.FC = () => (
    <div className="flex space-x-1">
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
);

const SuggestionButton: React.FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
    >
        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{text}</p>
    </button>
);


const AIAssistant: React.FC<AIAssistantProps> = ({ config2D, config3D, gpuConfig }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const messageIdCounter = useRef(0);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFeedback = (messageId: number, feedback: 'up' | 'down') => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, feedback: msg.feedback === feedback ? undefined : feedback } : msg
            )
        );
    };

    const handleSendMessage = async (promptText?: string) => {
        const currentInput = promptText || input;
        if (!currentInput.trim()) return;

        const userMessage: Message = { sender: 'user', text: currentInput, id: messageIdCounter.current++ };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const history = messages.map(msg => {
                let feedbackStr = '';
                if (msg.sender === 'model' && msg.feedback) {
                    feedbackStr = ` (User feedback on this response: ${msg.feedback === 'up' ? 'Positive' : 'Negative'})`;
                }
                return `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}${feedbackStr}`;
            }).join('\n\n');
            
            const context = `
                You are an expert AI Design Assistant for computer architecture, specializing in RISC-V, GPUs, and 3D-stacked integrated circuits.
                Your goal is to provide helpful, concise, and actionable advice to the user. Pay close attention to any user feedback provided in the conversation history to tailor your future responses.
                
                Here is the user's current set of configurations. Use this data to inform your response.
                
                2D Baseline CPU Configuration:
                ${JSON.stringify(config2D, null, 2)}
                
                3D Stacked CPU Configuration:
                ${JSON.stringify(config3D, null, 2)}

                GPU Configuration:
                ${JSON.stringify(gpuConfig, null, 2)}

                ---
                Conversation History:
                ${history}
                ---
                Current User Question: ${currentInput}
            `;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: context,
            });

            const modelMessage: Message = { sender: 'model', text: response.text, id: messageIdCounter.current++ };
            setMessages(prev => [...prev, modelMessage]);

        } catch (e: any) {
            console.error(e);
            setError('Failed to get a response from the AI assistant. Please check your API key configuration and network connection. ' + e.message);
        } finally {
            setLoading(false);
        }
    };
    
    const suggestionPrompts = [
        "Analyze my 3D CPU configuration for performance bottlenecks.",
        "Suggest improvements to my GPU's thermal design based on its current parameters.",
        "How could I improve the cache hit rate for my 2D CPU design?",
        "Compare my 2D and 3D CPU configurations and explain the key trade-offs.",
    ];
    
    const getTabClass = (tab: ActiveTab) => {
        return `flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors w-full justify-center ${
            activeTab === tab 
            ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-slate-100' 
            : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
        }`;
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="flex justify-center p-1 space-x-1 bg-slate-200 dark:bg-slate-900/50 rounded-lg mb-4 w-full sm:w-auto sm:mx-auto">
                <button onClick={() => setActiveTab('chat')} className={getTabClass('chat')}>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Design Chat</span>
                </button>
                <button onClick={() => setActiveTab('search')} className={getTabClass('search')}>
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    <span>Web Research</span>
                </button>
            </div>

            {activeTab === 'chat' ? (
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center py-10">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-cyan-500/10 p-4 rounded-full inline-block">
                                        <SparklesIcon className="w-10 h-10 text-cyan-500 dark:text-cyan-400" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Design Chat Assistant</h2>
                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                Ask a question or select a suggestion below to get expert analysis on your current configurations.
                                </p>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {suggestionPrompts.map((prompt, i) => (
                                        <SuggestionButton key={i} text={prompt} onClick={() => handleSendMessage(prompt)} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-500"><SparklesIcon className="w-5 h-5"/></div>}
                                <div className="flex flex-col items-start">
                                    <div className={`max-w-lg p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0">
                                            {msg.text.split('\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                                        </div>
                                    </div>
                                    {msg.sender === 'model' && (
                                        <div className="flex items-center space-x-1 mt-2">
                                            <button onClick={() => handleFeedback(msg.id, 'up')} className={`p-1.5 rounded-full transition-colors duration-200 ${msg.feedback === 'up' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`} aria-label="Good response">
                                                <HandThumbUpIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleFeedback(msg.id, 'down')} className={`p-1.5 rounded-full transition-colors duration-200 ${msg.feedback === 'down' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`} aria-label="Bad response">
                                                <HandThumbDownIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-500"><SparklesIcon className="w-5 h-5"/></div>
                                <div className="max-w-lg p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-bl-none">
                                    <LoadingSpinner />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-700 dark:text-red-300 flex items-start space-x-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Ask for analysis or suggestions on your designs..."
                                className="w-full p-4 pr-16 text-base bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200 transition-colors resize-none"
                                rows={2}
                                disabled={loading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={loading || !input.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                                aria-label="Send message"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                    <GoogleSearch />
                </div>
            )}
        </div>
    );
};

export default AIAssistant;