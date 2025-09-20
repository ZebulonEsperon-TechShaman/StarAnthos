import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
    messages: Message[];
    isThinking: boolean;
    onSendMessage: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isThinking, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isThinking) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-lg">
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700 rounded-lg p-3 max-w-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-150"></div>
                                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., 'What's the latency on transactionservice?'"
                        disabled={isThinking}
                        className="flex-grow w-full bg-gray-700 text-gray-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={isThinking}
                        className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-cyan-700 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;