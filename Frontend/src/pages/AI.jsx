import { useForm } from "react-hook-form";
import axiosClient from "../utils/axios";
import { useParams } from 'react-router';
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

function AI({ isDarkMode }) {
    const params = useParams();
    const problemId = params.id;
    const [messages, setMessages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of conversation
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isGenerating]);

    const onSubmit = async (data) => {
        const userMsg = { role: 'user', parts: [{ text: data.message }] };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        reset(); // Clear input
        setIsGenerating(true);

        try {
            // Send entire updated history array to the backend
            const response = await axiosClient.post(`/ai/message/${problemId}`, {
                messages: updatedMessages
            });

            // Add model response
            const modelMsg = { role: 'model', parts: [{ text: response.data }] };
            setMessages(prev => [...prev, modelMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="flex flex-col h-[calc(100vh-140px)] w-full relative">
            {/* Header info */}
            <div className={`flex items-center gap-2 pb-3 mb-3 border-b ${isDarkMode ? 'border-[#222222]' : 'border-gray-150'}`}>
                <div className="bg-red-500/10 p-1.5 rounded-lg text-red-600">
                    <Sparkles size={16} />
                </div>
                <div>
                    <h2 className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>CodeBits AI Assistant</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Powered by Gemini. Ask anything about this problem.</p>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 select-text">
                {messages.length === 0 && !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                        <Bot size={40} className={`${isDarkMode ? 'text-gray-700' : 'text-gray-300'} mb-2 animate-bounce`} />
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-450'}`}>No messages yet</p>
                        <p className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} max-w-[200px] mt-1`}>Ask for runtime explanations, complexity details, or debug hints!</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={index} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''} animate-fadeIn`}>
                            {/* Avatar */}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold
                                ${isUser 
                                    ? 'bg-red-500 text-white' 
                                    : isDarkMode ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                {isUser ? <User size={14} /> : <Bot size={14} />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed border
                                ${isUser 
                                    ? 'bg-red-600 text-white border-red-700/20 rounded-tr-none' 
                                    : isDarkMode 
                                        ? 'bg-[#151515] text-gray-250 border-[#222222] rounded-tl-none' 
                                        : 'bg-white text-gray-800 border-gray-150 rounded-tl-none'}`}>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{msg.parts[0]?.text || ''}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isGenerating && (
                    <div className="flex items-start gap-2.5 animate-pulse">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold
                            ${isDarkMode ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                            <Bot size={14} />
                        </div>
                        <div className={`rounded-2xl rounded-tl-none px-4 py-3 text-xs border
                            ${isDarkMode 
                                ? 'bg-[#151515] border-[#222222]' 
                                : 'bg-white border-gray-150'}`}>
                            <div className="flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="relative flex items-center mt-auto">
                <input
                    type="text"
                    placeholder="Ask AI a question..."
                    disabled={isGenerating}
                    className={`w-full pl-4 pr-12 py-3 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm border
                        ${isDarkMode 
                            ? 'bg-[#121212] border-[#222222] text-gray-100 placeholder-gray-700' 
                            : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'}`}
                    {...register("message", { required: true })}
                />
                <button
                    type="submit"
                    disabled={isGenerating}
                    className="absolute right-2.5 p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
}

export default AI;