import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquarePlus, Send, Search, User, X, Loader2, ArrowLeft } from 'lucide-react';
import axiosClient from '../utils/axios';
import Navbar from '../components/Navbar';

export default function ChatPage() {
    const { user } = useSelector((state) => state.auth);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    
    // Search queries
    const [chatSearch, setChatSearch] = useState('');
    const [modalSearch, setModalSearch] = useState('');
    
    // Loading states
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    // Inputs
    const [messageText, setMessageText] = useState('');
    
    // Refs
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    // Fetch initial chat list
    const fetchConversations = async () => {
        try {
            const { data } = await axiosClient.get('/chat/conversations');
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoadingChats(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    // Set up polling for conversations and active messages
    useEffect(() => {
        pollIntervalRef.current = setInterval(() => {
            fetchConversations();
            if (activeConversation) {
                fetchMessages(activeConversation._id, false);
            }
        }, 3000);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [activeConversation]);

    // Fetch message history for a specific conversation
    const fetchMessages = async (conversationId, showLoader = true) => {
        if (showLoader) setLoadingMessages(true);
        try {
            const { data } = await axiosClient.get(`/chat/conversations/${conversationId}/messages`);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    };

    // When active conversation changes, fetch messages and scroll
    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id, true);
        } else {
            setMessages([]);
        }
    }, [activeConversation]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Open Start Chat Modal & fetch system users
    const handleOpenModal = async () => {
        setShowNewChatModal(true);
        setLoadingUsers(true);
        try {
            const { data } = await axiosClient.get('/chat/users');
            setAllUsers(data);
        } catch (error) {
            console.error('Failed to fetch user list:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Select/Start conversation with a user
    const handleStartChat = async (targetUserId) => {
        try {
            const { data } = await axiosClient.post('/chat/conversations', { targetUserId });
            // Add conversation if not already in list
            if (!conversations.some(c => c._id === data._id)) {
                setConversations(prev => [data, ...prev]);
            }
            setActiveConversation(data);
            setShowNewChatModal(false);
            setModalSearch('');
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    };

    // Send a message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeConversation) return;

        const originalText = messageText;
        setMessageText('');

        try {
            const { data } = await axiosClient.post(`/chat/conversations/${activeConversation._id}/messages`, {
                text: originalText
            });
            setMessages(prev => [...prev, data]);
            
            // Instantly update lastMessage locally
            setConversations(prev => prev.map(c => {
                if (c._id === activeConversation._id) {
                    return {
                        ...c,
                        lastMessage: {
                            text: originalText,
                            sender: user._id,
                            createdAt: new Date()
                        }
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessageText(originalText); // restore on error
        }
    };

    // Filter conversations based on search
    const filteredConversations = conversations.filter(c => {
        const recipient = c.participants.find(p => p._id !== user?._id);
        const name = `${recipient?.firstName || ''} ${recipient?.lastName || ''}`.toLowerCase();
        return name.includes(chatSearch.toLowerCase());
    });

    // Filter database users based on search
    const filteredUsers = allUsers.filter(u => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        return name.includes(modalSearch.toLowerCase()) || u.emailId.toLowerCase().includes(modalSearch.toLowerCase());
    });

    // Get clean display name of conversation recipient
    const getRecipientName = (conversation) => {
        const recipient = conversation?.participants?.find(p => p._id !== user?._id);
        return recipient ? `${recipient.firstName} ${recipient.lastName || ''}` : 'Unknown User';
    };

    // Get initials for avatar
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 transition-colors flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 gap-6 h-[calc(100vh-4rem)]">
                {/* Conversations Sidebar */}
                <div className={`w-full md:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-[#121212] border border-gray-250/50 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-150 dark:border-gray-850 flex items-center justify-between">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Messages</h2>
                        <button
                            onClick={handleOpenModal}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-650 transition-colors"
                            title="Start New Chat"
                        >
                            <MessageSquarePlus size={20} />
                        </button>
                    </div>

                    {/* Chat Search Bar */}
                    <div className="p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={chatSearch}
                                onChange={(e) => setChatSearch(e.target.value)}
                                className="w-full bg-gray-55 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 text-xs transition-all"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-850">
                        {loadingChats ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                                <span className="text-xs text-gray-500">Loading chats...</span>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 px-4 text-xs text-gray-450">
                                {chatSearch ? 'No chats match search query' : 'No active chats. Click the + icon to start a conversation!'}
                            </div>
                        ) : (
                            filteredConversations.map((c) => {
                                const active = activeConversation?._id === c._id;
                                const rName = getRecipientName(c);
                                return (
                                    <div
                                        key={c._id}
                                        onClick={() => setActiveConversation(c)}
                                        className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${active ? 'bg-red-50/40 dark:bg-red-950/20 border-l-4 border-red-500' : 'hover:bg-gray-50 dark:hover:bg-[#181818]'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-sm font-bold text-white uppercase shadow-sm">
                                            {getInitials(rName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{rName}</h3>
                                                {c.lastMessage && (
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-450 dark:text-gray-400 truncate">
                                                {c.lastMessage ? (
                                                    <span>{c.lastMessage.sender === user._id ? 'You: ' : ''}{c.lastMessage.text}</span>
                                                ) : (
                                                    <span className="italic">No messages yet</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className={`flex-1 flex flex-col bg-white dark:bg-[#121212] border border-gray-250/50 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-150 dark:border-gray-850 flex items-center gap-3">
                                <button
                                    onClick={() => setActiveConversation(null)}
                                    className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                                    {getInitials(getRecipientName(activeConversation))}
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">{getRecipientName(activeConversation)}</h3>
                                    <span className="text-[10px] text-green-600 font-medium">Online</span>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text bg-[#fafaf9]/20 dark:bg-black/5">
                                {loadingMessages ? (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="h-7 w-7 animate-spin text-red-650" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                        <p className="text-xs font-semibold text-gray-500">Say hello!</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Send a message to start conversation.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isSelf = msg.sender === user._id;
                                        return (
                                            <div key={msg._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-xs shadow-sm leading-relaxed ${isSelf ? 'bg-red-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-250 rounded-tl-none'}`}>
                                                    <p>{msg.text}</p>
                                                    <span className={`block text-[9px] mt-1 text-right ${isSelf ? 'text-red-200' : 'text-gray-400'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-150 dark:border-gray-850 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    className="flex-1 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 text-xs transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageText.trim()}
                                    className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors flex items-center justify-center"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-65">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 mb-3">
                                <MessageSquarePlus size={24} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Your Inbox</h3>
                            <p className="text-xs text-gray-450 dark:text-gray-400 max-w-[240px] mt-1">Select an active conversation or click the start chat icon to find users.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Start Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121212] border border-gray-250 dark:border-gray-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-150 dark:border-gray-850 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Start a Conversation</h3>
                            <button
                                onClick={() => { setShowNewChatModal(false); setModalSearch(''); }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-450 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="p-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 text-xs transition-all"
                                />
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-850">
                            {loadingUsers ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-red-655" />
                                    <span className="text-[11px] text-gray-400">Fetching users...</span>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-10 text-xs text-gray-450">
                                    No users found in database
                                </div>
                            ) : (
                                filteredUsers.map((u) => {
                                    const name = `${u.firstName} ${u.lastName || ''}`;
                                    return (
                                        <div
                                            key={u._id}
                                            onClick={() => handleStartChat(u._id)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#181818] cursor-pointer transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                                                {getInitials(name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{name}</h4>
                                                <p className="text-[10px] text-gray-400 truncate">{u.emailId}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
